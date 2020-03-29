class Proxy:
    def __init__(self, foreignId, clientCall, clientSend, queue):
        self.id = foreignId
        self.queue = queue
        self.clientCall = clientCall
        self.clientSend = clientSend

    def callBlocking(self, selector, arguments):
        return self.queue.awaitResult(lambda: self.call(selector, arguments))

    def sendBlocking(self, selector, arguments):
        self.queue.awaitResult(lambda: self.send(selector, arguments))

    async def call(self, selector: str, arguments):
        return await self.clientCall(self.id, selector, arguments)

    async def send(self, selector: str, arguments):
        await self.clientSend(self.id, selector, arguments)


class Rpc:
    def __init__(self, loop, queue, clientService, send):
        self.loop = loop
        self.queue = queue
        self.clientService = clientService
        self.send = send
        self.proxyMap = {}
        self.callMap = {}
        self.nextCallId = 0

    async def clientCall(self, targetId, selector, arguments):
        argDescs = [self.wrapArgument(X) for X in arguments]

        callId, future = self.nextFuture()

        await self.send({
            'type': 'call',
            'id': callId,
            'target': targetId,
            'selector': selector,
            'arguments': argDescs
        })

        return await future

    async def clientSend(self, targetId, selector, arguments):
        argDescs = [self.wrapArgument(X) for X in arguments]

        await self.send({
            'type': 'send',
            'target': targetId,
            'selector': selector,
            'arguments': argDescs
        })

    async def receive(self, msg):
        if msg['type'] == 'send':
            self.dispatchSend(msg['target'], msg['selector'], msg['arguments'])
        elif msg['type'] == 'call':
            await self.dispatchCall(msg['id'], msg['target'], msg['selector'], msg['arguments'])
        elif msg['type'] == 'yield':
            self.dispatchYield(msg['id'], msg['result'])
        else:
            print("Unhandled message")

    async def dispatchCall(self, foreignId, targetId, selector: str, argDescs):
        target = self.clientService
        if targetId != 0: # expand to support whole dictionary of client objects
            target = self.dataset.lookup(targetId)

        method = getattr(target, selector)
        arguments = map(lambda X: self.unwrapArgument(X), argDescs)

        result = method(*arguments)

        await self.send({
            'type': 'return',
            'id': foreignId,
            'result': self.wrapArgument(result)
        })

    def dispatchSend(self, targetId, selector, argDescs):
        target = self.clientService
        if targetId != 0:
            target = self.dataset.lookup(targetId)

        method = getattr(target, selector)
        arguments = map(lambda X: self.unwrapArgument(X), argDescs)

        method(*arguments)

    def dispatchYield(self, localId, resultDesc):
        future = self.callMap[localId]
        del self.callMap[localId]

        future.set_result(self.unwrapArgument(resultDesc))

    class RpcEncodeException(Exception):
        def __init__(self, message):
            super().__init__(message)

    def unwrapArgument(self, arg):
        argType, argValue = arg['type'], arg['value']

        if argType == 'clientObj':
            return self.dataset.lookup(argValue)
        elif argType == 'hostObj':
            return self.resolveProxy(argValue)
        elif argType == 'list':
            return [self.unwrapArgument(X) for X in argValue]
        elif argType == 'map':
            return {K: self.unwrapArgument(V) for K, V in argValue}
        else: # int, float, string, boolean decoded natively
            return arg['value']

    def wrapArgument(self, arg):
        if arg == self.clientService: # expand to support whole dictionary of client objects
            return {'type': 'clientObj', 'value': 0}
        elif isinstance(arg, Proxy):
            return {'type': 'hostObj', 'value': arg.id}
        elif isinstance(arg, list):
            return {
                'type': 'list',
                'value': [self.wrapArgument(X) for X in arg]
            }
        elif isinstance(arg, dict):
            return {
                'type': 'map',
                'value': {K: self.wrapArgument(V) for K, V in arg}
            }
        elif isinstance(arg, int):
            return {'type': 'int', 'value': arg}
        elif isinstance(arg, float):
            return {'type': 'float', 'value': arg}
        elif isinstance(arg, bool):
            return {'type': 'bool', 'value': arg}
        elif isinstance(arg, str):
            return {'type': 'string', 'value': arg}
        else:
            raise self.RpcEncodeException("No encoding for argument type")

    def resolveProxy(self, id: int):
        if id in self.proxyMap:
            return self.proxyMap[id]

        proxy = Proxy(id, self.clientCall, self.clientSend, self.queue)
        self.proxyMap[id] = proxy
        return proxy

    def nextFuture(self):
        callId = self.nextCallId
        future = self.loop.create_future()
        self.callMap[callId] = future
        self.nextCallId += 1

        return callId, future

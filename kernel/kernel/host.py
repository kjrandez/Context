import json
import websockets
from asyncio import Future, AbstractEventLoop
from typing import Optional, List, Awaitable, Dict, Callable, Union, cast

from .dataset import Dataset
from .worker import Worker
from .element import Element, Transaction
from .elements.page import Page


Argument = Dict[str, object]


class TagCache:
    def __init__(self) -> None:
        self.refs: 'List[Future[object]]' = []
        self.nextIndex = 0
        self.freeIndexes: List[int] = []

    def assignTag(self, inst: 'Future[object]') -> int:
        if len(self.freeIndexes) > 0:
            index = self.freeIndexes.pop()
            self.refs[index] = inst
            return index
        else:
            self.refs.append(inst)
            index = self.nextIndex
            self.nextIndex += 1
            return index

    def getObject(self, tag: int) -> 'Future[object]':
        return self.refs[tag]

    def freeTag(self, tag: int) -> None:
        self.freeIndexes.append(tag)


class Proxy:
    def __init__(
            self, foreignId: int,
            clientCall: Callable[[int, str, List[object]], Awaitable[object]],
            clientSend: Callable[[int, str, List[object]], Awaitable[None]]) -> None:

        self.id = foreignId
        self.clientCall = clientCall
        self.clientSend = clientSend

    async def call(self, selector: str, arguments: List[object]) -> object:
        return await self.clientCall(self.id, selector, arguments)

    async def send(self, selector: str, arguments: List[object]) -> None:
        await self.clientSend(self.id, selector, arguments)


class ProxyMap:
    def __init__(self, makeProxy: Callable[[int], Proxy]) -> None:
        self.make = makeProxy
        self.refs: Dict[int, Proxy] = {}

    def getObject(self, tag: int) -> Proxy:
        if tag in self.refs:
            return self.refs[tag]

        proxy = self.make(tag)
        self.refs[tag] = proxy
        return proxy


class HostService:
    def __init__(self, dataset: Dataset) -> None:
        self.dataset = dataset

    def rootPage(self) -> Optional[Page]:
        return self.dataset.root

    def clipboardPage(self) -> Optional[Page]:
        return self.dataset.clipboard


class Host:
    def __init__(
            self, loop: AbstractEventLoop, websocket: websockets.WebSocketServerProtocol,
            dataset: Dataset, worker: Worker) -> None:

        self.loop = loop
        self.websocket = websocket
        self.worker = worker
        self.dataset = dataset

        def makeProxy(tag: int) -> Proxy:
            return Proxy(tag, self.clientCall, self.clientSend)

        self.pendingCalls = TagCache()
        self.proxyMap = ProxyMap(makeProxy)

        self.hostService = HostService(self.dataset)
        self.clientService = self.proxyMap.getObject(0)

    async def run(self) -> None:
        try:
            while True:
                message = json.loads(await self.websocket.recv())
                print("<< ---------- RECV ---------- << " + json.dumps(message, indent=2))
                await self.dispatch(message)
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")

    async def send(self, value: object) -> None:
        print(">> ---------- SEND ---------- >> " + json.dumps(value, indent=2))
        await self.websocket.send(json.dumps(value))

    async def broadcast(self, trans: Transaction) -> None:
        await self.clientService.send('broadcast', [trans])

    async def clientCall(self, targetId: int, selector: str, arguments: List[object]) -> object:
        argDescs = [self.encodedArgument(X) for X in arguments]
        future: 'Future[object]' = self.loop.create_future()

        await self.send({
            'type': 'call',
            'id': self.pendingCalls.assignTag(future),
            'target': targetId,
            'selector': selector,
            'arguments': argDescs
        })

        return await future

    async def clientSend(self, targetId: int, selector: str, arguments: List[object]) -> None:
        argDescs = map(lambda X: self.encodedArgument(X), arguments)

        await self.send({
            'type': 'send',
            'target': targetId,
            'selector': selector,
            'arguments': argDescs
        })

    async def dispatch(self, msg: Dict[str, object]) -> None:
        if msg['type'] == 'send':
            targetId = cast(int, msg['target'])
            selector = cast(str, msg['selector'])
            argDescs = cast(List[Argument], msg['arguments'])
            self.dispatchSend(targetId, selector, argDescs)
        elif msg['type'] == 'call':
            foreignId = cast(int, msg['id'])
            targetId = cast(int, msg['target'])
            selector = cast(str, msg['selector'])
            argDescs = cast(List[Argument], msg['arguments'])
            await self.dispatchCall(foreignId, targetId, selector, argDescs)
        elif msg['type'] == 'return':
            foreignId = cast(int, msg['id'])
            result = cast(Argument, msg['result'])
            self.dispatchReturn(foreignId, result)
        else:
            print("Unhandled message")

    async def dispatchCall(
            self, foreignId: int, targetId: int, selector: str,
            argDescs: List[Argument]) -> None:

        target: Union[HostService, Optional[Element]] = self.hostService
        if targetId != 0:
            target = self.dataset.lookup(targetId)

        method = getattr(target, selector)
        arguments = map(lambda X: self.decodedArgument(X), argDescs)

        result = method(*arguments)

        await self.send({
            'type': 'return',
            'id': foreignId,
            'result': self.encodedArgument(result)
        })

    def dispatchSend(self, targetId: int, selector: str, argDescs: List[Argument]) -> None:
        target: Union[HostService, Optional[Element]] = self.hostService
        if targetId != 0:
            target = self.dataset.lookup(targetId)
        method = getattr(target, selector)
        arguments = map(lambda X: self.decodedArgument(X), argDescs)

        method(*arguments)

    def dispatchReturn(self, localId: int, resultDesc: Dict[str, object]) -> None:
        future = self.pendingCalls.getObject(localId)
        self.pendingCalls.freeTag(localId)

        future.set_result(self.decodedArgument(resultDesc))

    def decodedArgument(self, arg: Argument) -> object:
        if arg['type'] == 'hostObject':
            if arg['id'] == 0:
                return self.hostService
            else:
                localId = cast(int, arg['id'])
                return self.dataset.lookup(localId)
        elif arg['type'] == 'clientObject':
            foreignId = cast(int, arg['id'])
            return self.proxyMap.getObject(foreignId)
        elif arg['type'] == 'list':
            return [self.decodedArgument(X) for X in cast(List, arg['value'])]
        elif arg['type'] == 'dictionary':
            return {K: self.decodedArgument(V) for K, V in cast(Dict, arg['value'])}
        else:
            return arg['value']

    def encodedArgument(self, arg: object) -> Argument:
        if arg == self.hostService:
            return {'type': 'hostObject', 'id': 0}
        elif isinstance(arg, Element):
            return {'type': 'hostObject', 'id': arg.id}
        elif isinstance(arg, Proxy):
            return {'type': 'clientObject', 'id': arg.id}
        elif isinstance(arg, list):
            return {
                'type': 'list',
                'value': [self.encodedArgument(X) for X in cast(List, arg)]
            }
        elif isinstance(arg, dict):
            return {
                'type': 'dictionary',
                'value': {K: self.encodedArgument(V) for K, V in cast(Dict, arg).items()}
            }
        else:
            return {'type': 'primitive', 'value': arg}

# OLD STUFF

# def addFilePrompt(parent):
#     from ..elements import FileRef

#     filenames = getFilenames(parent, [("All files", "*")])
#     for filename in filenames:
#         parent.append(FileRef(filename), True)

# def addImagePrompt(parent):
#     from ..elements import ImageRef

#     filenames = getFilenames(parent, [
#         ("Images", ".png .gif .jpeg .jpg .bmp .tiff .tif"),
#         ("All files", "*")
#     ])
#     for filename in filenames:
#         parent.append(ImageRef(filename), True)

# def getFilenames(parent, filetypes=None):
#     root = tk.Tk()
#     root.attributes("-topmost", True)
#     root.withdraw()
#     return list(tk.filedialog.askopenfilenames(filetypes=filetypes))

# classList = None
# def constructorFor(elementClass):
#     global classList

#     if classList == None:
#         from ..elements import Text, Page, Script, Link
#         classList = {
#             "Text" : Text,
#             "Page" : Page,
#             "Script" : Script,
#             "Link" : Link
#         }
    
#     return classList[elementClass]


#     async def update(self, trans):
#         if trans.index in self.ignoreTrans:
#             self.ignoreTrans.remove(trans.index)
#             return

#         if trans.element.id not in self.attachedIds:
#             return

#         await self.send({
#             "selector" : "update",
#             "arguments" : [trans.model(), trans.element.model()]
#         })

#     async def commandInvoke(self, data):
#         target = Dataset.singleton.lookup(data["element"])
#         selector = getattr(target, data["selector"])
#         arguments = [await self.decodedArgument(X) for X in data["arguments"]]

#         resultTrans = selector(*arguments)
#         if resultTrans != None:
#             if not data["respond"]:
#                 self.ignoreTrans.append(resultTrans)

#     async def commandInvokeInBackground(self, data):
#         target = Dataset.singleton.lookup(data["element"])
#         selector = getattr(target, data["selector"])
#         arguments = [await self.decodedArgument(X) for X in data["arguments"]]

#         await self.worker(selector, *arguments)

#     async def commandAttachElement(self, elementId):
#         if elementId not in self.attachedIds:
#             self.attachedIds.append(elementId)

#         await self.send({
#             "selector" : "model",
#             "arguments" : [Dataset.singleton.lookup(elementId).model()]
#         })

#     async def commandDetachElement(self, elementId):
#         self.attachedIds.remove(elementId)

#     async def commandAddFile(self, parentId):
#         parent = Dataset.singleton.lookup(parentId)
#         await self.worker(addFilePrompt, parent)

#     async def commandAddImage(self, parentId):
#         parent = Dataset.singleton.lookup(parentId)
#         await self.worker(addImagePrompt, parent)

#    #Part of resolved argument     
#         if isinstance(arg, list):
#             return [await self.decodedArgument(x) for x in arg]
#         elif arg["type"] == "obj":
#             return Dataset.singleton.lookup(arg["value"])
#         elif arg["type"] == "new":
#             elementClass = arg["value"]["elementType"]
#             constructorArgs = [await self.decodedArgument(x) for x in arg["value"]["args"]]
#             constructor = constructorFor(elementClass)
#             inst = constructor(*constructorArgs)
#             await self.worker(inst.backgroundInit)
#             return inst
#         elif arg["type"] == "dup":
#             orig = Dataset.singleton.lookup(arg["value"])
#             newInst = copy.deepcopy(orig)
#             await self.worker(newInst.backgroundInit)
#             return newInst
#         else:
#             return arg["value"]

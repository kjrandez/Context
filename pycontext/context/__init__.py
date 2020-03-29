import threading
import asyncio
import websockets
import janus
import json

from .rpc import Rpc


class Client:
    def __init__(self):
        self.hostService = None

    def connect(self):
        sigConnected = threading.Event()
        threading.Thread(target=self.run, args=(sigConnected,)).start()

        while self.hostService is None and not sigConnected.isSet():
            sigConnected.wait()

        return self.hostService

    def disconnect(self):
        pass

    def run(self, sigConnected):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        queue = TaskQueue(loop)

        def onConnect(hostService):
            self.hostService = hostService
            sigConnected.set()

        loop.create_task(queue.spin())
        loop.create_task(self.spin(loop, queue, ClientService(onConnect)))
        loop.run_forever()

    async def spin(self, loop, queue, clientService):
        async with websockets.connect("ws://localhost:8085/broadcast") as websocket:
            async def send(message):
                await websocket.send(json.dumps(message))

            rpc = Rpc(loop, queue, clientService, send)
            while True:
                message = json.loads(await websocket.recv())
                await rpc.receive(message)

class ClientService:
    def __init__(self, onConnect):
        self.onConnect = onConnect

    def hello(self, hostService):
        self.onConnect(hostService)


class TaskQueue:
    def __init__(self, loop):
        self.queue = janus.Queue(loop=loop)

    async def spin(self):
        while True:
            task = await self.queue.async_q.get()
            result = await task.callable()
            task.resolve(result)

    def awaitResult(self, callable):
        task = self.BlockingTask(callable)
        self.queue.sync_q.put(task)

        while not task.completed:
            task.event.wait()

        return task.result

    class BlockingTask:
        def __init__(self, callable):
            self.callable = callable
            self.result = None
            self.completed = False
            self.event = threading.Event()

        def resolve(self, result):
            self.result = result
            self.completed = True
            self.event.set()

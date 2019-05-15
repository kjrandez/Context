import asyncio
import websockets
import json
from aioconsole import ainput
import threading
import janus
from .core import Dataset, Ledger, Local, Remote
from typing import List, Any, Callable


class Kernel:
    def __init__(self) -> None:
        self.workThreadQueue: janus.Queue[Any]
        self.ledger: Ledger

        self.workThreadSignal = threading.Event()

    def workThreadEntry(self) -> None:
        self.workThreadSignal.wait(0.2)
        if self.workThreadQueue is None:
            return

        while True:
            block = self.workThreadQueue.sync_q.get()
            if block is None:
                return
            block()

    def asyncThreadEntry(self, loop: asyncio.AbstractEventLoop) -> None:
        self.loop = loop
        self.remotes: List[Remote] = []

        self.ledger = Ledger(loop)
        data = Dataset(self.ledger)
        data.makeDefault()
        self.root = data.root

        self.workThreadQueue = janus.Queue(loop=loop)
        self.workThreadSignal.set()

        loop.create_task(self.persistence())
        loop.create_task(self.console())

        startup = websockets.serve(self.connection, 'localhost', 8085)
        loop.run_until_complete(startup)

    def asyncThreadExit(self) -> None:
        self.workThreadQueue.sync_q.put(None)

    async def runInWorkThread(self, block: Callable[[Any], Any], *args: Any) -> None:
        def executeBlock() -> None:
            block(*args)
        await self.workThreadQueue.async_q.put(executeBlock)

    async def connection(self, websocket: websockets.WebSocket, path: str) -> None:
        print("Connection at path: " + path)
        if not path == "/broadcast":
            return

        async def send(value: Any) -> None:
            print(">> ---------- SEND ---------- >> " + json.dumps(value, indent=2))
            await websocket.send(json.dumps(value))

        handler = Remote(self.root, self.runInWorkThread, self.loop.create_future, send)
        self.remotes.append(handler)
        try:
            while True:
                message = json.loads(await websocket.recv())
                print("<< ---------- RECV ---------- << " + json.dumps(message, indent=2))
                await handler.dispatch(message)
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")
            self.remotes.remove(handler)

    async def console(self) -> None:
        print("Console started")

        handler = Local(self.root, self.ledger)
        while True:
            command = await ainput("")
            await handler.dispatch(command)

    async def persistence(self) -> None:
        while True:
            transaction = await self.ledger.next()
            for remote in self.remotes:
                await remote.update(transaction)

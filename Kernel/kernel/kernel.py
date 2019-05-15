import asyncio
import websockets
from typing import List

from . import Local, Remote, Worker
from .data import Dataset, Ledger


class Kernel:
    def __init__(self, loop: asyncio.AbstractEventLoop) -> None:
        self.loop = loop
        self.remotes: List[Remote] = []
        self.worker = Worker(loop)
        self.ledger = Ledger(loop)
        self.dataset = Dataset(self.ledger)
        self.dataset.makeDefault()

    def asyncThreadEntry(self, loop: asyncio.AbstractEventLoop) -> None:
        loop.create_task(self.persistence())
        loop.create_task(self.console())

        server = websockets.serve(self.connection, 'localhost', 8085)
        loop.run_until_complete(server)

    def asyncThreadExit(self) -> None:
        self.worker.finish()

    async def connection(self, websocket: websockets.WebSocketServerProtocol, path: str) -> None:
        print("Connection at path: " + path)
        if not path == "/broadcast":
            return

        handler = Remote(self.loop, websocket, self.dataset, self.worker)
        self.remotes.append(handler)
        await handler.run()
        self.remotes.remove(handler)

    async def console(self) -> None:
        handler = Local(self.dataset.root, self.ledger)
        await handler.run()

    async def persistence(self) -> None:
        while True:
            transaction = await self.ledger.next()
            for remote in self.remotes:
                await remote.update(transaction)

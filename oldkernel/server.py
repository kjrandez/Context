from threading import Thread
import asyncio
import websockets
from typing import List

from .host import Host
from .ledger import Ledger
from .dataset import Dataset


class Server(Thread):
    def __init__(self, loop: asyncio.AbstractEventLoop, dataset: Dataset, ledger: Ledger):
        super().__init__()

        self.loop = loop
        self.ledger = ledger
        self.dataset = dataset
        self.remotes: List[Host] = []
        self.killServer = self.loop.create_future()

    def run(self) -> None:
        asyncio.set_event_loop(self.loop)
        self.loop.create_task(self.persistence())
        self.loop.run_until_complete(self.server())
        print("Server stopped")

    def stop(self) -> None:
        self.killServer.set_result(None)

    async def persistence(self) -> None:
        while True:
            transaction = await self.ledger.next()
            for remote in self.remotes:
                await remote.broadcast(transaction)

    async def server(self) -> None:
        async with websockets.serve(self.connection, 'localhost', 8085):
            await self.killServer

    async def connection(self, websocket: websockets.WebSocketServerProtocol, path: str) -> None:
        # print("Connection at path: " + path)
        if not path == "/broadcast":
            return

        handler = Host(self.loop, websocket, self.dataset)

        self.remotes.append(handler)
        await handler.run()
        self.remotes.remove(handler)

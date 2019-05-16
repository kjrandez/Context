import asyncio
import websockets
from typing import List

from element import setGlobalObserver
from local import Local
from host import Host
from worker import Worker
from dataset import Dataset
from ledger import Ledger


class Kernel:

    """ The kernel comprises the top-level modules, an asyncio event loop, and a worker thread. """

    def __init__(self, loop: asyncio.AbstractEventLoop) -> None:
        self.loop = loop
        self.remotes: List[Host] = []
        self.worker = Worker(self.loop)
        self.dataset = Dataset()

        self.ledger = Ledger(self.loop, self.dataset)
        setGlobalObserver(self.ledger)

        self.dataset.loadExample()

    def run(self) -> None:
        self.loop.create_task(self.persistence())
        self.loop.create_task(self.console())
        self.loop.run_until_complete(websockets.serve(self.connection, 'localhost', 8085))
        self.loop.run_forever()

    def halted(self) -> None:
        self.worker.finish()

    async def connection(self, websocket: websockets.WebSocketServerProtocol, path: str) -> None:
        print("Connection at path: " + path)
        if not path == "/broadcast":
            return

        handler = Host(self.loop, websocket, self.dataset, self.worker)

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
                await remote.broadcast(transaction)


async def periodic() -> None:
    while True:
        await asyncio.sleep(0.2)

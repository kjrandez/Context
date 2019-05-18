from IPython.terminal.embed import InteractiveShellEmbed
from threading import Thread
import asyncio
import websockets
from typing import List

from .element import setGlobalObserver
from .host import Host
from .worker import Worker
from .dataset import Dataset
from .ledger import Ledger


class Kernel(Thread):

    """ The kernel comprises the top-level modules, an asyncio event loop, and a worker thread. """

    def __init__(self) -> None:
        super().__init__()

        self.loop = asyncio.new_event_loop()
        self.remotes: List[Host] = []
        self.worker = Worker(self.loop)
        self.dataset = Dataset()
        self.killServer = self.loop.create_future()
        self.ledger = Ledger(self.loop, self.dataset)

        setGlobalObserver(self.ledger)

        self.dataset.loadExample()

    def start(self) -> None:
        print("Starting worker")
        self.worker.start()

        print("Starting server")
        super().start()

        print("Starting console")
        shell = InteractiveShellEmbed(user_ns={})
        shell.mainloop(local_ns={"root": self.dataset.root})
        print("Console stopped")

        self.killServer.set_result(None)
        self.worker.finish()

    def run(self) -> None:
        asyncio.set_event_loop(self.loop)
        self.loop.create_task(self.persistence())
        self.loop.run_until_complete(self.server())
        print("Server stopped")

    async def persistence(self) -> None:
        while True:
            transaction = await self.ledger.next()
            for remote in self.remotes:
                await remote.broadcast(transaction)

    async def server(self) -> None:
        async with websockets.serve(self.connection, 'localhost', 8085):
            await self.killServer

    async def connection(self, websocket: websockets.WebSocketServerProtocol, path: str) -> None:
        print("Connection at path: " + path)
        if not path == "/broadcast":
            return

        handler = Host(self.loop, websocket, self.dataset, self.worker)

        self.remotes.append(handler)
        await handler.run()
        self.remotes.remove(handler)

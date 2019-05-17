import asyncio
import websockets
from typing import List, Coroutine

from .element import setGlobalObserver
from .local import Local
from .host import Host
from .worker import Worker
from .dataset import Dataset
from .ledger import Ledger


class Kernel:

    """ The kernel comprises the top-level modules, an asyncio event loop, and a worker thread. """

    def __init__(self) -> None:
        self.loop = asyncio.get_event_loop()
        self.remotes: List[Host] = []
        self.worker = Worker(self.loop)
        self.dataset = Dataset()
        self.killServer = self.loop.create_future()
        self.tasks: List[asyncio.Task] = []
        self.ledger = Ledger(self.loop, self.dataset)

        setGlobalObserver(self.ledger)

        self.dataset.loadExample()

    def run(self) -> None:
        for coro in [periodic(), self.persistence(), self.console()]:
            self.runTask(coro)

        self.worker.start()

        try:
            self.loop.run_until_complete(self.server())
            print("Kernel loop stopped")
        except KeyboardInterrupt:
            print("Kernel loop interrupted")
        finally:
            self.worker.finish()

    def runTask(self, coro: Coroutine):
        task = self.loop.create_task(coro)
        self.tasks.append(task)

    async def console(self) -> None:
        handler = Local(self.dataset, self.stop)
        await handler.run()

    async def persistence(self) -> None:
        while True:
            transaction = await self.ledger.next()
            for remote in self.remotes:
                await remote.broadcast(transaction)

    async def server(self) -> None:
        async with websockets.serve(self.connection, 'localhost', 8085):
            await self.killServer

    async def stop(self) -> None:
        self.killServer.set_result(None)

        thisTask = asyncio.current_task()

        tasks = [t for t in self.tasks if t is not thisTask]
        for task in tasks:
            task.cancel()

        thisTask.cancel()

    async def connection(self, websocket: websockets.WebSocketServerProtocol, path: str) -> None:
        print("Connection at path: " + path)
        if not path == "/broadcast":
            return

        handler = Host(self.loop, websocket, self.dataset, self.worker)

        self.remotes.append(handler)
        await handler.run()
        self.remotes.remove(handler)


async def periodic() -> None:
    while True:
        await asyncio.sleep(0.2)

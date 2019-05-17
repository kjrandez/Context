import threading
import asyncio
import janus
from typing import Any, Callable


class Worker(threading.Thread):
    def __init__(self, loop: asyncio.AbstractEventLoop) -> None:
        super(Worker, self).__init__()
        self.finished = False
        self.workThreadQueue: janus.Queue[Callable[[], None]] = janus.Queue(loop=loop)

    def run(self) -> None:
        while not self.finished:
            block = self.workThreadQueue.sync_q.get()
            block()
        print("Worker thread stopped")

    async def execute(self, block: Callable[[Any], Any], *args: Any) -> None:
        def executeBlock() -> None:
            block(*args)
        await self.workThreadQueue.async_q.put(executeBlock)

    def finish(self) -> None:
        self.finished = True

        def push() -> None:
            pass

        self.workThreadQueue.sync_q.put(push)

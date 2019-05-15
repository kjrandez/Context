import asyncio
import janus
import threading
from typing import Optional

from kernel.data import Transaction


class Ledger:
    def __init__(self, loop: asyncio.AbstractEventLoop) -> None:
        self.forward = []
        self.reverse = []
        self.queue = janus.Queue(loop=loop)
        self.lock = threading.Lock()
        self.ongoing = None

    async def next(self) -> Transaction:
        return await self.queue.async_q.get()

    def begin(self, trans: Transaction) -> None:
        if trans.reverse is None:
            self.lock.acquire()
            self.ongoing = trans
        else:
            assert False
            # Need to check if trans is a reversed operation,
            # if so, the lock is already obtained, and the reverse index
            # should be that of the ongoing transaction
            pass

    def cancel(self, trans: Transaction) -> None:
        assert trans == self.ongoing

        self.lock.release()

    def complete(self, trans: Transaction) -> None:
        assert trans == self.ongoing

        self.forward.append(trans)
        self.reverse.clear()
        self.queue.sync_q.put(trans)

        self.lock.release()

    def undo(self, endTrans: Optional[Transaction] = None) -> None:
        self.lock.acquire()
        # Perform reverse
        self.lock.release()

    def redo(self, endTrans: Optional[Transaction] = None) -> None:
        self.lock.acquire()
        # Perform reverse
        self.lock.release()

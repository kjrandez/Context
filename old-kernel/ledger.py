from asyncio import AbstractEventLoop
from janus import Queue
import threading
from typing import Optional

from .element import IObserver, Element, Transaction
from .dataset import Dataset


class Ledger(IObserver):
    def __init__(self, loop: AbstractEventLoop, dataset: Dataset) -> None:
        self.dataset = dataset
        self.queue: Queue[Transaction] = Queue(loop=loop)
        self.lock = threading.Lock()
        self.ongoing: Optional[Transaction] = None
        self.nextTransaction = 0

    def elementCreated(self, inst: Element) -> int:
        return self.dataset.append(inst)

    def transactionStarted(self, trans: Transaction) -> int:
        newTransactionId = self.nextTransaction
        self.nextTransaction += 1

        self.lock.acquire()
        self.ongoing = trans

        return newTransactionId

    def transactionCompleted(self, trans: Transaction) -> None:
        assert trans == self.ongoing

        self.queue.sync_q.put(trans)
        self.lock.release()

    async def next(self) -> Transaction:
        return await self.queue.async_q.get()

    def transactionCancelled(self, trans: Transaction) -> None:
        assert trans == self.ongoing

        self.lock.release()

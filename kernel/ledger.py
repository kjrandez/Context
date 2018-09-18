import janus
import threading

# Synchronized access global ledger.
# One transaction at a time can be performed/undone/redone.

class Ledger:
    def __init__(self, loop):
        self.forward = []
        self.reverse = []
        self.queue = janus.Queue(loop = loop)
        self.lock = threading.Lock()
        self.ongoing = None

    async def next(self):
        return await self.queue.async_q.get()

    def begin(self, trans):
        if trans.reverse == None:
            self.lock.acquire()
            self.ongoing = trans
        else:
            # Need to check if trans is a reversed operation,
            # if so, the lock is already obtained, and the reverse index
            # should be that of the ongoing transaction
            pass

    def cancel(self, trans):
        assert trans == self.ongoing

        self.lock.release()
    
    def complete(self, trans):
        assert trans == self.ongoing

        self.forward.append(trans)
        self.reverse.clear()
        self.queue.sync_q.put(trans)

        self.lock.release()

    def undo(self, endTrans = None):
        self.lock.acquire()
        # Perform reverse 
        self.lock.release()
    
    def redo(self, endTrans = None):
        self.lock.acquire()
        # Perform reverse
        self.lock.release()

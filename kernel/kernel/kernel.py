from IPython.terminal.embed import InteractiveShellEmbed
import asyncio

from .element import setGlobalObserver
from .worker import Worker
from .dataset import Dataset
from .ledger import Ledger
from .server import Server


class Kernel:

    """ The kernel comprises the top-level modules, server and worker threads, and a console. """

    def __init__(self) -> None:
        super().__init__()

        self.loop = asyncio.new_event_loop()
        self.worker = Worker(self.loop)
        self.dataset = Dataset()
        self.ledger = Ledger(self.loop, self.dataset)
        self.server = Server(self.loop, self.dataset, self.ledger)

        setGlobalObserver(self.ledger)
        self.dataset.loadExample()

    def start(self) -> None:
        print("Starting worker")
        self.worker.start()

        print("Starting server")
        self.server.start()

        print("Starting console")
        shell = InteractiveShellEmbed(user_ns={})
        shell.mainloop(local_ns={"root": self.dataset.root})
        print("Console stopped")

        self.server.stop()
        self.worker.stop()
        self.server.join()
        self.worker.join()

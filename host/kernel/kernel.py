import websockets
import json
from aioconsole import ainput

from .core import Dataset, Ledger, Local, Remote
from .elements import Page

class Kernel:
    def __init__(self, loop):
        self.ledger = Ledger(loop)
        self.remotes = []

        data = Dataset(self.ledger)
        data.makeDefault()
        self.root = data.root

        loop.create_task(self.persistence())
        loop.create_task(self.console())

        startup = websockets.serve(self.connection, 'localhost', 8085)
        loop.run_until_complete(startup)

    async def connection(self, websocket, path):
        print("Connection at path: " + path)
        if not path == "/broadcast":
            return

        handler = Remote(self.root, self.ledger, websocket)
        self.remotes.append(handler)
        try:
            while True:
                message = json.loads(await websocket.recv())
                print("Received: " + json.dumps(message, indent=4))
                await handler.dispatch(message)
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")
            self.remotes.remove(handler)

    async def console(self):
        print("Console started")
        
        handler = Local(self.root, self.ledger)
        while True:
            command = await ainput("")
            await handler.dispatch(command)

    async def persistence(self):
        while True:
            transaction = await self.ledger.next()
            for remote in self.remotes:
                await remote.update(transaction)

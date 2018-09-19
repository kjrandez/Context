import asyncio
import websockets
import json
from aioconsole import ainput
import janus

from local import Local
from remote import Remote
from ledger import Ledger
import model

class Kernel:
    def __init__(self, loop):
        self.ledger = Ledger(loop)
        self.root = model.default(self.ledger)
        self.remotes = []

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
            if(command == "exit"):
                asyncio.get_event_loop().stop()
                break
            await handler.dispatch(command)

    async def persistence(self):
        while True:
            transaction = await self.ledger.next()
            for remote in self.remotes:
                await remote.mutation(transaction)

async def periodic():
    while True:
        await asyncio.sleep(0.2)

if __name__ == "__main__":
    try:
        loop = asyncio.get_event_loop()
        Kernel(loop)
        loop.create_task(periodic())
        loop.run_forever()
    except KeyboardInterrupt:
        raise

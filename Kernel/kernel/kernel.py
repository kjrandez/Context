import websockets
import json
from aioconsole import ainput
import threading
import janus

from .core import Dataset, Ledger, Local, Remote
from .elements import Page

class Kernel:
    def __init__(self):
        self.workThreadSignal = threading.Event() 
        self.workThreadQueue = None

    def workThreadEntry(self):
        self.workThreadSignal.wait(0.2)
        if self.workThreadQueue == None:
            return

        while True:
            block = self.workThreadQueue.sync_q.get()
            if block == None:
                return
            block()

    def asyncThreadEntry(self, loop):
        self.remotes = []

        self.ledger = Ledger(loop)
        data = Dataset(self.ledger)
        data.makeDefault()
        self.root = data.root

        self.workThreadQueue = janus.Queue(loop = loop)
        self.workThreadSignal.set()

        loop.create_task(self.persistence())
        loop.create_task(self.console())

        startup = websockets.serve(self.connection, 'localhost', 8085)
        loop.run_until_complete(startup)

    def asyncThreadExit(self):
        self.workThreadQueue.sync_q.put(None)

    async def runInWorkThread(self, block, *args):
        def executeBlock():
            block(*args)
        await self.workThreadQueue.async_q.put(executeBlock)

    async def connection(self, websocket, path):
        print("Connection at path: " + path)
        if not path == "/broadcast":
            return

        async def send(value):
            print(">> ---------- SEND ---------- >> " + json.dumps(value, indent=2))
            await websocket.send(json.dumps(value))

        handler = Remote(self.root, self.runInWorkThread, send)
        self.remotes.append(handler)
        try:
            while True:
                message = json.loads(await websocket.recv())
                print("<< ---------- RECV ---------- << " + json.dumps(message, indent=2))
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

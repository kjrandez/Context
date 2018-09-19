import json
from ..elements import Page

class Remote:
    def __init__(self, root, observer, websocket):
        self.observer = observer
        self.websocket = websocket
        
        self.commands = {
            "requestTopPage" : self.commandRequestTopPage
        }

        self.setRoot(root)

    def setRoot(self, root):
        self.root = root
        self.flattened = self.root.flattened()
        self.senseKeys = self.flattened.keys()

    async def mutation(self, transaction):
        print("Transaction #" + str(transaction.index) + " " + json.dumps(transaction.model()))

    async def dispatch(self, msg):
        if msg["selector"] in self.commands:
            await self.commands[msg["selector"]](msg)

    async def commandRequestTopPage(self, msg):
        await self.websocket.send(json.dumps({
            "selector" : "renderPage",
            "arguments" : [self.root.key, self.flattened]
        }))

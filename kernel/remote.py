import json
from elements import Page

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

        flattened = root.traverse()
        self.senseList = flattened.keys()
        self.modelList = flattened.values()

    async def mutation(self, transaction):
        print("Transaction #" + str(transaction.index) + " " + json.dumps(transaction.model()))

    async def dispatch(self, msg):
        if msg["selector"] in self.commands:
            await self.commands[msg["selector"]](msg)

    async def commandRequestTopPage(self, msg):
        self.websocket.send(json.dumps({
            "selector" : "renderPage",
            "arguments" : [self.root.key, self.modelList]
        }))

# WARNING: Update this function to work with recursive pages
# and remember to update sensitivity list after relevant mutations

def sensitivityList(element):
    list = [self.root.traverse()]

    if isinstance(element, Page):
        for child in element.content:
            list = list + sensitivityList(child)

    return list

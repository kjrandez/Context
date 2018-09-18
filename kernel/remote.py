import json
from elements import Page

class Remote:
    def __init__(self, root, observer, websocket):
        self.root = root
        self.sensitivity = sensitivityList(self.root)
        self.observer = observer
        self.websocket = websocket
        
        self.commands = {
            "requestTopPage" : self.commandRequestTopPage
        }

    async def mutation(self, transaction):
        print("Transaction #" + str(transaction.index) + " " + json.dumps(transaction.model()))

    def dispatch(self, msg):
        if msg["selector"] in self.commands:
            return self.commands[msg["selector"]](msg)
        else:
            return None

    def commandRequestTopPage(self, msg):
        return json.dumps({
            "selector" : "renderPage",
            "arguments" : [self.root.model()]
        })

# WARNING: Update this function to work with recursive pages
# and remember to update sensitivity list after relevant mutations

def sensitivityList(element):
    list = [element.key]

    if isinstance(element, Page):
        for child in element.content:
            list = list + sensitivityList(child)

    return list

import json
from model import topPage

class Remote:
    def __init__(self):
        self.root = topPage
        self.sensitivity = sensitivityList(self.root)

        self.commands = {
            "requestTopPage" : self.commandRequestTopPage
        }

    async def dispatch(self, msg):
        if msg["selector"] in self.commands:
            print("Client called " + msg["selector"])
            return self.commands[msg["selector"]](self, msg)
        else:
            return None

    async def commandRequestTopPage(self, msg):
        return json.dumps({
            "selector" : "renderPage",
            "arguments" : [topPage.model()]
        })

def sensitivityList(element):
    list = [element.key]

    if element.type == "page":
        for child in element.content:
            list = list + sensitivityList(child)

    return list

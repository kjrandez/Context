import json

class Remote:
    def __init__(self, root, observer, websocket):
        self.root = root
        self.sensitivity = sensitivityList(self.root)
        self.observer = observer
        self.websocket = websocket
        
        self.commands = {
            "requestTopPage" : self.commandRequestTopPage
        }

    def mutation(self, element):
        print("Mutation observed for: " + str(element.key))

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

def sensitivityList(element):
    list = [element.key]

    if element.type == "page":
        for child in element.content:
            list = list + sensitivityList(child)

    return list

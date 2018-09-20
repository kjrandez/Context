import json
from .dataset import Dataset

class Remote:
    def __init__(self, root, observer, websocket):
        self.root = root
        self.observer = observer
        self.websocket = websocket
        self.remoteTrans = []
        self.topPage = None

        self.commands = {
            "requestRoot" : self.commandRequestRoot,
            "requestPage" : self.commandRequestPage,
            "invoke" : self.commandInvoke
        }

    async def dispatch(self, msg):
        if msg["selector"] in self.commands:
            await self.commands[msg["selector"]](msg)

    async def commandInvoke(self, msg):
        target = Dataset.singleton.lookup(msg.target)
        selector = getattr(target, msg.selector)
        arguments = [resolvedArgument(X) for X in msg.arguments]

        resultTrans = selector(target, *arguments)
        self.remoteTrans.append(resultTrans)

    async def commandRequestRoot(self, msg):
        await self.providePage(self.root)

    async def commandRequestPage(self, msg):
        await self.providePage(Dataset.singleton.lookup(msg["page"]))

    async def update(self, trans):
        print("Transaction #" + str(trans.index) + " " + json.dumps(trans.model()))
        if trans in self.remoteTrans:
            self.remoteTrans.remove(trans)
            return
        if not trans.element.key in self.senseKeys:
            return

        updatedModels = [trans.element.model()]
        updatedModels = updatedModels + [X.model() for X in trans.others]

        await self.websocket.send(json.dumps({
            "selector" : "update",
            "arguments" : [trans.model(), updatedModels]
        }))

    async def providePage(self, page):
        self.setTopPage(page)

        await self.websocket.send(json.dumps({
            "selector" : "renderPage",
            "arguments" : [self.topPage.key, self.flattened]
        }))

    def setTopPage(self, page):
        self.topPage = page
        self.flattened = self.topPage.flattened()
        self.senseKeys = self.flattened.keys()

def resolvedArgument(arg):
    if arg.valueType == "object":
        return Dataset.singleton.lookup(arg.value)
    else:
        return arg.value

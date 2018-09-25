import json
from .dataset import Dataset

class Remote:
    def __init__(self, root, observer, websocket):
        self.root = root
        self.observer = observer
        self.websocket = websocket
        self.ignoreTrans = []
        self.topPage = None

        print("Making new remote")

        self.commands = {
            "requestRoot" : self.commandRequestRoot,
            "requestPage" : self.commandRequestPage,
            "invoke" : self.commandInvoke,
            "addFile" : self.commandAddFile,
            "addImage" : self.commandAddImage
        }

    async def dispatch(self, msg):
        if msg["selector"] in self.commands:
            await self.commands[msg["selector"]](msg["data"])

    async def commandInvoke(self, data):
        target = Dataset.singleton.lookup(data["element"])
        selector = getattr(target, data["selector"])
        arguments = [resolvedArgument(X) for X in data["arguments"]]

        resultTrans = selector(*arguments)
        if resultTrans != None:
            if not data["respond"]:
                self.ignoreTrans.append(resultTrans)

    async def commandRequestRoot(self, data):
        await self.providePage(self.root)

    async def commandRequestPage(self, data):
        await self.providePage(Dataset.singleton.lookup(data["page"]))

    async def commandAddFile(self, data):
        parent = Dataset.singleton.lookup(data["page"])
        print("Adding file to parent: " + str(data["page"]))
        print(str(parent))

    async def commandAddImage(self, data):
        parent = Dataset.singleton.lookup(data["page"])
        print("Adding image to parent: " + str(data["page"]))
        print(str(parent))

    async def update(self, trans):
        if trans.index in self.ignoreTrans:
            self.ignoreTrans.remove(trans.index)
            return
        if not trans.element.id in self.senseIds:
            return

        updatedModels = self.incorporateOthers(trans.others)
        updatedModels[trans.element.id] = trans.element.model()

        await self.websocket.send(json.dumps({
            "selector" : "update",
            "arguments" : [trans.model(), updatedModels]
        }))

    async def providePage(self, page):
        self.setTopPage(page)

        await self.websocket.send(json.dumps({
            "selector" : "renderPage",
            "arguments" : [self.topPage.id, self.flattened]
        }))

    def setTopPage(self, page):
        self.topPage = page
        self.flattened = self.topPage.flatten()
        self.senseIds = list(self.flattened.keys())

    def incorporateOthers(self, others):
        updatedModels = {}

        def noteUpdatedModel(model):
            id = model["id"]
            updatedModels[id] = model
            self.senseIds.append(id)

        for element in others:
            element.flatten(self.flattened, noteUpdatedModel)

        return updatedModels

classList = None

def constructorFor(elementClass):
    global classList

    if classList == None:
        from ..elements import Text, Page, Script, Link
        classList = {
            "Text" : Text,
            "Page" : Page,
            "Script" : Script,
            "Link" : Link
        }
    
    return classList[elementClass]

def resolvedArgument(arg):
    if arg["type"] == "obj":
        return Dataset.singleton.lookup(arg["value"])
    elif arg["type"] == "new":
        elementClass = arg["value"]["elementType"]
        constructorArgs = [resolvedArgument(x) for x in arg["value"]["args"]]
        constructor = constructorFor(elementClass)
        return constructor(*constructorArgs)
    else:
        return arg["value"]

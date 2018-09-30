import json
from .dataset import Dataset
import threading
import tkinter as tk
import tkinter.filedialog as filedialog
import copy

class Remote:
    def __init__(self, root, worker, websocket):
        self.root = root
        self.worker = worker
        self.websocket = websocket
        self.ignoreTrans = []
        self.topPage = None
        self.pasteboard = Dataset.singleton.pasteboard

        print("Making new remote")

        self.commands = {
            "requestRoot" : self.commandRequestRoot,
            "requestPage" : self.commandRequestPage,
            "invoke" : self.commandInvoke,
            "invokeInBackground" : self.commandInvokeInBackground,
            "addFile" : self.commandAddFile,
            "addImage" : self.commandAddImage
        }

    async def dispatch(self, msg):
        if msg["selector"] in self.commands:
            await self.commands[msg["selector"]](msg["data"])

    async def commandInvoke(self, data):
        target = Dataset.singleton.lookup(data["element"])
        selector = getattr(target, data["selector"])
        arguments = [await self.resolvedArgument(X) for X in data["arguments"]]

        resultTrans = selector(*arguments)
        if resultTrans != None:
            if not data["respond"]:
                self.ignoreTrans.append(resultTrans)

    async def commandInvokeInBackground(self, data):
        target = Dataset.singleton.lookup(data["element"])
        selector = getattr(target, data["selector"])
        arguments = [await self.resolvedArgument(X) for X in data["arguments"]]

        await self.worker(selector, arguments)

    async def commandRequestRoot(self, data):
        await self.providePage(self.root, None)

    async def commandRequestPage(self, data):
        await self.providePage(Dataset.singleton.lookup(data["page"]), data["path"])

    async def commandAddFile(self, data):
        parent = Dataset.singleton.lookup(data["page"])
        await self.worker(addFilePrompt, parent)

    async def commandAddImage(self, data):
        parent = Dataset.singleton.lookup(data["page"])
        await self.worker(addImagePrompt, parent)

    async def update(self, trans):
        if trans.index in self.ignoreTrans:
            self.ignoreTrans.remove(trans.index)
            return

        # Send any models which are relevant to the transaction but which the
        # remote was not previously sensitive to
        newModels = {}
        if trans.element.id in self.senseIds:
            newModels = self.incorporateElements(trans.others, True)
        elif trans.element.id in self.shallowSenseIds:
            newModels = self.incorporateElements(trans.others, False)
        else:
            return

        # Also provide the model of the element updated by the transaction
        newModels[trans.element.id] = trans.element.model()

        await self.websocket.send(json.dumps({
            "selector" : "update",
            "arguments" : [trans.model(), newModels]
        }))

    async def providePage(self, page, path):
        self.setTopPage(page, path)

        await self.websocket.send(json.dumps({
            "selector" : "renderPage",
            "arguments" : [self.topPage.id, self.pasteboard.id, self.flattened]
        }))

    def setTopPage(self, page, path):
        self.topPage = page
        self.flattened = {}
        self.senseIds = []
        self.shallowSenseIds = []

        # Generate flattened model based on top page, deep
        self.incorporateElements([self.topPage], True)

        # Incorporate pasteboard page into model, shallow
        self.incorporateElements([self.pasteboard], False)

        # Incorporate parent path pages into model, shallow
        if path != None:
            pathPages = [Dataset.singleton.lookup(x) for x in path]
            self.incorporateElements(pathPages, False)

    def incorporateElements(self, elements, deep):
        newModelEntries = {}

        def noteUpdatedModel(model):
            id = model["id"]
            newModelEntries[id] = model
            if deep:
                self.senseIds.append(id)
            else:
                self.shallowSenseIds.append(id)

        # For shallow, maxDepth = 2 for example:
        # (0) - Pasteboard, (1) - Page in Pasteboard, (2) - Element in Page giving Title
        # (0) - Path Page, (1) - Element in Page giving Title, (2) - Extraneous data
        maxDepth = 2 if not deep else None
        for element in elements:
            element.flatten(self.flattened, noteUpdatedModel, maxDepth)

        return newModelEntries

    async def resolvedArgument(self, arg):
        if isinstance(arg, list):
            return [await self.resolvedArgument(x) for x in arg]
        elif arg["type"] == "obj":
            return Dataset.singleton.lookup(arg["value"])
        elif arg["type"] == "new":
            elementClass = arg["value"]["elementType"]
            constructorArgs = [await self.resolvedArgument(x) for x in arg["value"]["args"]]
            constructor = constructorFor(elementClass)
            inst = constructor(*constructorArgs)
            await self.worker(inst.backgroundInit)
            return inst
        elif arg["type"] == "dup":
            orig = Dataset.singleton.lookup(arg["value"])
            newInst = copy.deepcopy(orig)
            await self.worker(newInst.backgroundInit)
            return newInst
        else:
            return arg["value"]

def addFilePrompt(parent):
    filenames = getFilenames(parent, [("All files", "*")])
    print(filenames)

def addImagePrompt(parent):
    filenames = getFilenames(parent, [
        ("Images", ".png .gif .jpeg .jpg .bmp .tiff .tif"),
        ("All files", "*")
    ])
    print(filenames)

def getFilenames(parent, filetypes=None):
    root = tk.Tk()
    root.attributes("-topmost", True)
    root.withdraw()
    return list(tk.filedialog.askopenfilenames(filetypes=filetypes))

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

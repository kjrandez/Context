import json
from .dataset import Dataset
import threading
import tkinter as tk
import tkinter.filedialog as filedialog
import copy

class Remote:
    def __init__(self, root, worker, send):
        self.root = root
        self.worker = worker
        self.send = send
        self.clipboard = Dataset.singleton.clipboard
        self.ignoreTrans = []
        self.attachedIds = []

        self.commands = {
            "requestRoot" : self.commandRequestRoot,
            "attachElement" : self.commandAttachElement,
            "detachElement" : self.commandDetachElement,
            "invoke" : self.commandInvoke,
            "invokeInBackground" : self.commandInvokeInBackground,
            "addFile" : self.commandAddFile,
            "addImage" : self.commandAddImage
        }

    async def dispatch(self, msg):
        if msg["selector"] in self.commands:
            await self.commands[msg["selector"]](msg["data"])
        else:
            print("Invalid remote selector: " + msg["selector"])

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

        await self.worker(selector, *arguments)

    async def commandRequestRoot(self, nil):
        await self.send({
            "selector" : "root",
            "arguments" : [self.root.id, self.clipboard.id]
        })

    async def commandAttachElement(self, elementId):
        if elementId not in self.attachedIds:
            self.attachedIds.append(elementId)

        await self.send({
            "selector" : "model",
            "arguments" : [Dataset.singleton.lookup(elementId).model()]
        })

    async def commandDetachElement(self, elementId):
        self.attachedIds.remove(elementId)

    async def commandAddFile(self, parentId):
        parent = Dataset.singleton.lookup(parentId)
        await self.worker(addFilePrompt, parent)

    async def commandAddImage(self, parentId):
        parent = Dataset.singleton.lookup(parentId)
        await self.worker(addImagePrompt, parent)

    async def update(self, trans):
        if trans.index in self.ignoreTrans:
            self.ignoreTrans.remove(trans.index)
            return

        if trans.element.id not in self.attachedIds:
            return

        await self.send({
            "selector" : "update",
            "arguments" : [trans.model(), trans.element.model()]
        })

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
    from ..elements import FileRef

    filenames = getFilenames(parent, [("All files", "*")])
    for filename in filenames:
        parent.append(FileRef(filename), True)


def addImagePrompt(parent):
    from ..elements import ImageRef

    filenames = getFilenames(parent, [
        ("Images", ".png .gif .jpeg .jpg .bmp .tiff .tif"),
        ("All files", "*")
    ])
    for filename in filenames:
        parent.append(ImageRef(filename), True)

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

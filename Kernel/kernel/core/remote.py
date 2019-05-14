import json
from .dataset import Dataset
import threading
import tkinter as tk
import tkinter.filedialog as filedialog
import copy

class Proxy:
    def __init__(self, clientCall, foreignId):
        self.foreignId = foreignId
        self.clientCall = clientCall

    def invoke(self, selector, arguments):
        self.clientCall(selector, arguments)

class Remote:
    def __init__(self, root, runInBackground, createFuture, send):
        self.root = root
        self.runInBackground = runInBackground
        self.createFuture = createFuture
        self.send = send
        
        self.refs = []
        self.refIndex = 0
        self.freeRefIndexes = []

    def newLocalId(self, object):
        if len(self.freeRefIndexes) > 0:
            index = self.freeRefIndexes.pop()
            self.refs[index] = object
            return index
        else:
            self.refs.append(object)
            index = self.refIndex
            self.refIndex = self.refIndex + 1
            return index
    
    def lookupLocalId(self, index):
        return self.refs[index]

    def freeLocalId(self, index):
        self.refs[index] = None
        self.freeRefIndexes.append(index)

    async def dispatch(self, msg):
        if msg["type"] == "call":
            await self.dispatchCall(msg["id"], msg["target"], msg["selector"], msg["arguments"])
        elif msg["type"] == "return":
            self.dispatchReturn(msg["id"], msg["result"])

    async def dispatchCall(self, foreignId, targetId, selector, argDescs):
        target = self
        if targetId != 0:
            target = Dataset.singleton.lookup(targetId)
        method = getattr(target, selector)
        arguments = [self.decodedArgument(X) for X in argDescs]

        result = method(*arguments)

        await self.send({
            "type" : "return",
            "id" : foreignId,
            "result" : self.encodedArgument(result)
        })

    async def dispatchReturn(self, localId, resultDesc):
        future = self.lookupLocalId(localId)
        self.freeLocalId(localId)

        future.setResult(self.decodedArgument(resultDesc))

    async def clientCall(self, targetId, selector, arguments):
        argDescs = [self.encodedArgument(X) for X in arguments]
        future = self.createFuture()

        await self.send({
            "type" : "call",
            "id" : self.newLocalId(future),
            "target" : targetId,
            "selector" : selector,
            "arguments" : argDescs
        })

        return await future

    def rootPage(self):
        return self.root

    def clipboardPage(self):
        return Dataset.singleton.clipboard

    def decodedArgument(self, arg):
        if arg["type"] == "hostObject":
            if arg["id"] == 0:
                return self
            else:
                return Dataset.singleton.lookup(arg["id"])
        elif arg["type"] == "clientObject":
            return Proxy(self.clientCall, arg["id"])
        else:
            return arg["value"]

    def encodedArgument(self, arg):
        from ..elements import Element

        if arg == self:
            return { "type" : "hostObject", "id" : 0 }
        elif isinstance(arg, Element):
            return { "type" : "hostObject", "id" : arg.id }
        elif isinstance(arg, Proxy):
            return { "type" : "clientObject", "id" : arg.id }
        else:
            return { "type" : "primitive", "value" : arg }

# OLD STUFF

# def addFilePrompt(parent):
#     from ..elements import FileRef

#     filenames = getFilenames(parent, [("All files", "*")])
#     for filename in filenames:
#         parent.append(FileRef(filename), True)

# def addImagePrompt(parent):
#     from ..elements import ImageRef

#     filenames = getFilenames(parent, [
#         ("Images", ".png .gif .jpeg .jpg .bmp .tiff .tif"),
#         ("All files", "*")
#     ])
#     for filename in filenames:
#         parent.append(ImageRef(filename), True)

# def getFilenames(parent, filetypes=None):
#     root = tk.Tk()
#     root.attributes("-topmost", True)
#     root.withdraw()
#     return list(tk.filedialog.askopenfilenames(filetypes=filetypes))

# classList = None
# def constructorFor(elementClass):
#     global classList

#     if classList == None:
#         from ..elements import Text, Page, Script, Link
#         classList = {
#             "Text" : Text,
#             "Page" : Page,
#             "Script" : Script,
#             "Link" : Link
#         }
    
#     return classList[elementClass]


#     async def update(self, trans):
#         if trans.index in self.ignoreTrans:
#             self.ignoreTrans.remove(trans.index)
#             return

#         if trans.element.id not in self.attachedIds:
#             return

#         await self.send({
#             "selector" : "update",
#             "arguments" : [trans.model(), trans.element.model()]
#         })

#     async def commandInvoke(self, data):
#         target = Dataset.singleton.lookup(data["element"])
#         selector = getattr(target, data["selector"])
#         arguments = [await self.decodedArgument(X) for X in data["arguments"]]

#         resultTrans = selector(*arguments)
#         if resultTrans != None:
#             if not data["respond"]:
#                 self.ignoreTrans.append(resultTrans)

#     async def commandInvokeInBackground(self, data):
#         target = Dataset.singleton.lookup(data["element"])
#         selector = getattr(target, data["selector"])
#         arguments = [await self.decodedArgument(X) for X in data["arguments"]]

#         await self.worker(selector, *arguments)

#     async def commandAttachElement(self, elementId):
#         if elementId not in self.attachedIds:
#             self.attachedIds.append(elementId)

#         await self.send({
#             "selector" : "model",
#             "arguments" : [Dataset.singleton.lookup(elementId).model()]
#         })

#     async def commandDetachElement(self, elementId):
#         self.attachedIds.remove(elementId)

#     async def commandAddFile(self, parentId):
#         parent = Dataset.singleton.lookup(parentId)
#         await self.worker(addFilePrompt, parent)

#     async def commandAddImage(self, parentId):
#         parent = Dataset.singleton.lookup(parentId)
#         await self.worker(addImagePrompt, parent)

#    #Part of resolved argument     
#         if isinstance(arg, list):
#             return [await self.decodedArgument(x) for x in arg]
#         elif arg["type"] == "obj":
#             return Dataset.singleton.lookup(arg["value"])
#         elif arg["type"] == "new":
#             elementClass = arg["value"]["elementType"]
#             constructorArgs = [await self.decodedArgument(x) for x in arg["value"]["args"]]
#             constructor = constructorFor(elementClass)
#             inst = constructor(*constructorArgs)
#             await self.worker(inst.backgroundInit)
#             return inst
#         elif arg["type"] == "dup":
#             orig = Dataset.singleton.lookup(arg["value"])
#             newInst = copy.deepcopy(orig)
#             await self.worker(newInst.backgroundInit)
#             return newInst
#         else:
#             return arg["value"]

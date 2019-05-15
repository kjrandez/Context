from __future__ import annotations
import json
import asyncio
import websockets
from typing import Callable, List, Any, Awaitable, Dict

from .data import Dataset
from .worker import Worker
from .elements import Element, Page


class Proxy:
    def __init__(self, clientCall: Callable[[int, str, List[Any]], Awaitable[Any]], foreignId: int):
        self.foreignId = foreignId
        self.clientCall = clientCall

    async def call(self, selector: str, arguments: List[Any]) -> Any:
        return await self.clientCall(self.foreignId, selector, arguments)


class ProxyMap:
    pass


class TagCache:
    pass


class Remote:
    def __init__(
            self, loop: asyncio.AbstractEventLoop, websocket: websockets.WebSocketServerProtocol,
            dataset: Dataset, worker: Worker) -> None:
        self.loop = loop
        self.websocket = websocket
        self.worker = worker
        self.dataset = dataset

        self.refs: List[Any] = []
        self.refIndex = 0
        self.freeRefIndexes: List[int] = []

    async def run(self) -> None:
        try:
            while True:
                message = json.loads(await self.websocket.recv())
                print("<< ---------- RECV ---------- << " + json.dumps(message, indent=2))
                await self.dispatch(message)
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")

    async def send(self, value: Any) -> None:
        print(">> ---------- SEND ---------- >> " + json.dumps(value, indent=2))
        await self.websocket.send(json.dumps(value))

    def newLocalId(self, object: Any) -> int:
        if len(self.freeRefIndexes) > 0:
            index = self.freeRefIndexes.pop()
            self.refs[index] = object
            return index
        else:
            self.refs.append(object)
            index = self.refIndex
            self.refIndex = self.refIndex + 1
            return index

    def lookupLocalId(self, index: int) -> Any:
        return self.refs[index]

    def freeLocalId(self, index: int) -> None:
        self.refs[index] = None
        self.freeRefIndexes.append(index)

    async def dispatch(self, msg: Dict[str, Any]) -> None:
        if msg["type"] == "call":
            await self.dispatchCall(msg["id"], msg["target"], msg["selector"], msg["arguments"])
        elif msg["type"] == "return":
            self.dispatchReturn(msg["id"], msg["result"])

    async def dispatchCall(
            self, foreignId: int, targetId: int, selector: str,
            argDescs: List[Any]) -> None:
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

    def dispatchReturn(self, localId: int, resultDesc: Dict[str, Any]) -> None:
        future = self.lookupLocalId(localId)
        self.freeLocalId(localId)

        future.setResult(self.decodedArgument(resultDesc))

    async def clientCall(self, targetId: int, selector: str, arguments: List[Any]) -> Any:
        argDescs = [self.encodedArgument(X) for X in arguments]
        future = self.loop.create_future()

        await self.send({
            "type" : "call",
            "id" : self.newLocalId(future),
            "target" : targetId,
            "selector" : selector,
            "arguments" : argDescs
        })

        return await future

    def rootPage(self) -> Page:
        return self.dataset.root

    def clipboardPage(self) -> Page:
        return self.dataset.clipboard

    def decodedArgument(self, arg: Dict[str, Any]) -> Any:
        if arg["type"] == "hostObject":
            if arg["id"] == 0:
                return self
            else:
                return Dataset.singleton.lookup(arg["id"])
        elif arg["type"] == "clientObject":
            return Proxy(self.clientCall, arg["id"])
        else:
            return arg["value"]

    def encodedArgument(self, arg: Any) -> Dict[str, Any]:
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

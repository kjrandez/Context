from aioconsole import ainput

class Local:
    def __init__(self, root, observer):
        from ..elements import Text, Page, Image

        self.root = root
        self.observer = observer
        self.context = root
        self.clipboard = None

        self.commands = {
            "list" : self.commandList,
            "enter" : self.commandEnter,
            "root" : self.commandRoot,
            "exec" : self.commandExec,
            "insert" : self.commandInsert,
            "remove" : self.commandRemove,
            "paste" : self.commandPaste,
            "copy" : self.commandCopy,
            "clip" : self.commandClip
        }
        self.classList = {
            "text" : Text,
            "image" : Image,
            "page" : Page
        }

    async def dispatch(self, message):
        parts = message.split()
        if len(parts) == 0:
            return
        
        command = parts[0]
        args = " ".join(parts[1:])

        if parts[0] in self.commands:
            await self.commands[command](args)
        else:
            print("Error")

    async def commandList(self, args):
        i = 0
        for entry in self.context.content:
            print(str(i) + ") " + entry.etype + "_" + str(entry.key))
            i = i + 1

    async def commandEnter(self, args):
        entryIndex = int(args)
        newContext = self.context.content[entryIndex]
        if newContext.isPage():
            self.context = newContext
            print("Entered " + self.context.etype + "_" + str(self.context.key))
        else:
            print("Error")

    async def commandRoot(self, args):
        self.context = self.root
        print("Entered " + self.context.etype + "_" + str(self.context.key))

    async def commandExec(self, args):
        code = ""
        while True:
            line = await ainput(" | ")
            if line == "GO":
                break
            else:
                line = line +  "\n"
                code = code + line
        
        self.context.localExec(code)

    async def commandInsert(self, args):
        if not (args in self.classList):
            print("Error")
            return
        
        instClass = self.classList[args]
        constructorArgs = []
        while True:
            line = await ainput(" + ")
            if line == "GO":
                break
            else:
                constructorArgs.append(line)

        inst = instClass(*constructorArgs)
        print(inst)
        self.context.append(inst)

    async def commandRemove(self, args):
        index = int(args)
        inst = self.context.content[index]
        self.context.removeAt(index)
        print(inst)

    async def commandCopy(self, args):
        index = int(args)
        inst = self.context.content[index]
        self.clipboard = inst
        print(inst)

    async def commandPaste(self, args):
        if self.clipboard == None:
            print("Error")
            return
        
        inst = self.clipboard
    
        print(inst)
        self.context.append(inst)

    async def commandClip(self, args):
        print(self.clipboard)

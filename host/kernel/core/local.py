import json
from aioconsole import ainput
from .dataset import Dataset

class Local:
    def __init__(self, root, observer):
        from ..elements import Text, Page, Image, Script

        self.root = root
        self.observer = observer
        self.context = root

        self.commands = {
            "list" : self.commandList,
            "enter" : self.commandEnter,
            "root" : self.commandRoot,
            "exec" : self.commandExec,
            "make" : self.commandMake
        }
        self.classList = {
            "Text" : Text,
            "Image" : Image,
            "Page" : Page,
            "Script" : Script
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
        print("Listing " + str(self.context.key))
        for entry in self.context.content:
            print(str(i) + ". " + type(entry).__name__ + " " + str(entry.key))
            i = i + 1

    async def commandEnter(self, args):
        newContext = Dataset.singleton.lookup(int(args))
        if newContext.isPage():
            self.context = newContext
            print("Entered " + str(self.context.key))
        else:
            print("Error")

    async def commandRoot(self, args):
        self.context = self.root
        print("Entered " + str(self.context.key))

    async def commandExec(self, args):
        split = args.split()
        target = Dataset.singleton.lookup(int(split[0]))
        selector = selector = getattr(target, split[1])

        arguments = await promptArgs()
        selector(*arguments)

    async def commandMake(self, args):
        if not (args in self.classList):
            print("Error")
            return

        instClass = self.classList[args]

        constructorArgs = await promptArgs()
        inst = instClass(*constructorArgs)
        print("Key: " + str(inst.key))

async def promptArgs():
    args = []
    while True:
        line = await ainput(" | ")
        if line == "GO":
            break
        else:
            if line[0] == "+":
                args.append(Dataset.singleton.lookup(int(line[1:])))
            else:
                args.append(json.loads(line))
    return args
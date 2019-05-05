import json
import traceback
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
            "invoke" : self.commandInvoke,
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
            try:
                await self.commands[command](args)
            except KeyboardInterrupt:
                raise
            except:
                trace = traceback.format_exc()
                print(trace)
        else:
            print("Error")

    async def commandList(self, args):
        i = 0
        print("Listing " + str(self.context.id))
        for entry in self.context.content:
            print("#" + str(entry.key) + " " + type(entry.element).__name__ + " " + str(entry.element.id))
            i = i + 1

    async def commandEnter(self, args):
        from ..elements import Page
        newContext = Dataset.singleton.lookup(int(args))
        if isinstance(newContext, Page):
            self.context = newContext
            print("Entered " + str(self.context.id))
        else:
            print("Error")

    async def commandRoot(self, args):
        self.context = self.root
        print("Entered " + str(self.context.id))

    async def commandInvoke(self, args):
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
        print("Id: " + str(inst.id))

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
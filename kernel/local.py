import json
import traceback
from aioconsole import ainput
from typing import List, Optional

from .dataset import Dataset
from .elements.text import Text
from .elements.page import Page
from .elements.image import Image
from .elements.script import Script


class Local:
    def __init__(self, dataset: Dataset):
        self.dataset = dataset
        self.root: Optional[Page] = dataset.root
        self.context: Optional[Page] = self.root

        self.commands = {
            "list": self.commandList,
            "enter": self.commandEnter,
            "root": self.commandRoot,
            "invoke": self.commandInvoke,
            "make": self.commandMake
        }
        self.classList = {
            "Text": Text,
            "Image": Image,
            "Page": Page,
            "Script": Script
        }

    async def run(self) -> None:
        print("Console started")
        while True:
            command = await ainput("")
            await self.dispatch(command)

    async def dispatch(self, message: str) -> None:
        parts = message.split()
        if len(parts) == 0:
            return

        command = parts[0]
        args = " ".join(parts[1:])

        if parts[0] in self.commands:
            # noinspection PyBroadException
            try:
                await self.commands[command](args)
            except KeyboardInterrupt:
                raise
            except Exception:
                trace = traceback.format_exc()
                print(trace)
        else:
            print("Error")

    async def commandList(self, _: str) -> None:
        if self.context is None:
            return

        i = 0
        print("Listing " + str(self.context.id))
        for entry in self.context.content:
            output = "#" + str(entry.key) + " " + type(entry.element).__name__
            output += " " + str(entry.element.id)
            print(output)
            i = i + 1

    async def commandEnter(self, args: str) -> None:
        newContext = self.dataset.lookup(int(args))
        if isinstance(newContext, Page):
            self.context = newContext
            print("Entered " + str(self.context.id))
        else:
            print("Error")

    async def commandRoot(self, _: str) -> None:
        if self.root is None:
            return

        self.context = self.root

        print("Entered " + str(self.context.id))

    async def commandInvoke(self, args: str) -> None:
        split = args.split()
        target = self.dataset.lookup(int(split[0]))
        selector = getattr(target, split[1])

        arguments = await self.promptArgs()
        selector(*arguments)

    async def commandMake(self, args: str) -> None:
        if not (args in self.classList):
            print("Error")
            return

        instClass = self.classList[args]

        constructorArgs = await self.promptArgs()
        inst = instClass(*constructorArgs)
        print("Id: " + str(inst.id))

    async def promptArgs(self) -> List[object]:
        args: List[object] = []
        while True:
            line = await ainput(" | ")
            if line == "GO":
                break
            else:
                if line[0] == "+":
                    args.append(self.dataset.lookup(int(line[1:])))
                else:
                    args.append(json.loads(line))
        return args

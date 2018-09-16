from aioconsole import ainput
from model import topPage
from elements import Text, Page, Image

context = topPage
clipboard = None

async def dispatch(message):
    global commands
    
    parts = message.split()
    if len(parts) == 0:
        return
    
    command = parts[0]
    args = " ".join(parts[1:])

    if parts[0] in commands:
        await commands[command](args)
    else:
        print("Error")

async def commandList(args):
    global context

    i = 0
    for entry in context.content:
        print(str(i) + ") " + entry.type + "_" + str(entry.key))
        i = i + 1

async def commandEnter(args):
    global context
    global prevContext

    entryIndex = int(args)
    newContext = context.content[entryIndex]
    if newContext != None and newContext.type == "page":
        prevContext = context
        context = newContext
        print("Entered " + context.type + "_" + str(context.key))
    else:
        print("Error")

async def commandRoot(args):
    global context
    global topPage

    context = topPage
    print("Entered " + context.type + "_" + str(context.key))

async def commandExec(args):
    global context

    code = ""
    while True:
        line = await ainput(" | ")
        if line == "GO":
            break
        else:
            line = line +  "\n"
            code = code + line
    
    context.localExec(code)

async def commandInsert(args):
    if not (args in classList):
        print("Error")
        return
    
    instClass = classList[args]
    constructorArgs = []
    while True:
        line = await ainput(" + ")
        if line == "GO":
            break
        else:
            constructorArgs.append(line)

    inst = instClass(*constructorArgs)
    print(inst)
    context.append(inst)

async def commandRemove(args):
    index = int(args)
    inst = context.content[index]
    context.removeAt(index)
    print(inst)

async def commandCopy(args):
    global clipboard
    
    index = int(args)
    inst = context.content[index]
    clipboard = inst
    print(inst)

async def commandPaste(args):
    global clipboard
    
    if clipboard == None:
        print("Error")
        return
    
    inst = clipboard
    print(inst)
    context.append(inst)

async def commandClip(args):
    global clipboard
    print(clipboard)

commands = {
    "list" : commandList,
    "enter" : commandEnter,
    "root" : commandRoot,
    "exec" : commandExec,
    "insert" : commandInsert,
    "remove" : commandRemove,
    "paste" : commandPaste,
    "copy" : commandCopy,
    "clip" : commandClip
}

classList = {
    "text" : Text,
    "image" : Image,
    "page" : Page
}

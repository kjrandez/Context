import asyncio
import websockets
import json
from aioconsole import ainput
from local import Local
from remote import Remote
import model

async def connection(websocket, path):
    global remotes
    global root

    print("Connection at path: " + path)
    if not path == "/broadcast":
        return

    handler = Remote(root, observer, websocket)
    remotes.append(handler)
    try:
        while True:
            message = json.loads(await websocket.recv())

            print("Received: " + json.dumps(message, indent=4))

            result = handler.dispatch(message)
            if result != None:
                await websocket.send(result)
    except websockets.exceptions.ConnectionClosed:
        print("Connection closed")

async def console():
    global root

    print("Console started")
    
    handler = Local(root, observer)
    while True:
        command = await ainput("")
        if(command == "exit"):
            asyncio.get_event_loop().stop()
            break
        await handler.dispatch(command)

async def periodic():
    while True:
        await asyncio.sleep(0.2)

def observer(element):
    global remotes

    for handler in remotes:
        handler.mutation(element)

remotes = []
root = model.default(observer)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    start_server = websockets.serve(connection, 'localhost', 8085)

    loop.create_task(console())
    loop.create_task(periodic())
    loop.run_until_complete(start_server)

    try:
        loop.run_forever()
    except KeyboardInterrupt as ex:
        print("Keyboard interrupt")

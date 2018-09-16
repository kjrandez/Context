import asyncio
import websockets
import json
from aioconsole import ainput
import local
import remote

async def connection(websocket, path):
    print("Connection at path: " + path)

    try:
        while True:
            message = json.loads(await websocket.recv())

            print("Received: ")
            print(json.dumps(message, indent=4))

            result = await remote.dispatch(message)
            if result != None:
                await websocket.send(result)
    except websockets.exceptions.ConnectionClosed:
        print("Connection closed")

async def console():
    print("Console started")
    
    while True:
        command = await ainput("")
        if(command == "exit"):
            asyncio.get_event_loop().stop()
            break
        await local.dispatch(command)

async def periodic():
    while True:
        await asyncio.sleep(0.2)

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

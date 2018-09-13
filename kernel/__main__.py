import asyncio
import websockets
import json

key = 0

def nextKey():
    global key
    key = key + 1
    return "itm" + str(key)

def default(type, value):
    return {
        "key" : nextKey(),
        "meta" : {},
        "type" : type,
        "value" : value
    }

def columns(value):
    return default('columns', value)

def image(value):
    return default('image', value)

def page(value):
    return default('page', value)

def text(value):
    return default('text', value)

lorem1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vestibulum at erat eget suscipit. Nulla rhoncus libero sapien, id molestie nibh luctus in. Pellentesque tristique nulla sit amet eros sodales, quis luctus enim congue. Integer placerat viverra sollicitudin. In libero ligula, interdum nec pellentesque non, elementum vel dolor. Aenean ut nisl vulputate, interdum urna eget, placerat enim. Vestibulum felis turpis, elementum ac malesuada id, lacinia at justo. In laoreet mauris et nibh ullamcorper convallis. Maecenas faucibus ipsum at congue scelerisque. Aliquam sem purus, pharetra suscipit condimentum quis, imperdiet at ex. Vestibulum maximus mattis odio, sed elementum dolor feugiat eget. Aliquam consectetur, neque vitae porta dictum, ante dui posuere libero, id euismod nisi dolor at ipsum.'
lorem2 = 'Maecenas vitae eros non lacus tincidunt ultrices sit amet id massa. Praesent pretium ante sit amet sapien suscipit eleifend. In hac habitasse platea dictumst. Nulla erat nisi, elementum vitae tempor ut, vehicula sit amet nibh. Vestibulum cursus fermentum enim, vel mollis augue sodales ut. Suspendisse in mattis justo. In eget ipsum blandit dolor ultricies euismod. Mauris sit amet massa maximus, placerat nisi nec, dignissim ipsum. Donec sodales id lectus sit amet pulvinar. Pellentesque sodales felis fringilla ultrices tincidunt. Phasellus vehicula lorem sed felis pulvinar, id porta mi commodo.'
lorem3 = 'Donec imperdiet id lectus eu hendrerit. Curabitur sodales libero sit amet eros venenatis, nec venenatis lacus bibendum. Ut aliquam convallis diam vitae interdum. Maecenas laoreet tempus pretium. Suspendisse ac dui tortor. Nulla rutrum fermentum dui ut gravida. Curabitur egestas erat ut ligula fermentum convallis. Nulla maximus, eros non semper mollis, lacus nulla ullamcorper risus, eu condimentum risus tellus eu est. In ut urna pulvinar, aliquet ligula pharetra, interdum nunc. Praesent dignissim vehicula arcu, et semper dolor porta vel. Maecenas semper porta gravida. Proin tortor augue, mattis ut luctus in, semper vitae nisi. Vivamus egestas, mi mollis elementum egestas, nibh sapien euismod justo, ac cursus metus risus id ante. Nam placerat velit ac orci ullamcorper, id dapibus odio bibendum.'

def defaultPage():
    return page([
        text('### Hello world'),
        text('How are you doing today?'),
        text("I'm doing just fine thank you very much."),
        columns([
            page([
                page([
                    text('Introduction'),
                    text(lorem1)
                ]),
                page([
                    text('Mas informacion'),
                    text(lorem2)
                ]),
                page([
                    text('[Scope_0]'),
                    image('lol2.png')
                ])
            ]),
            page([
                text(lorem3)
            ])
        ]),
        image('sw.png'),
        page([
            text("This is pretty funy if you actually think about it for a second."),
            text("I really can't agree with that statement")
        ]),
        text('Just to finish it off right here.'),
        text("Actually I'll go ahead and add a bit more to be sure...")
    ])

async def consumer(msg):
    if(msg["selector"] == "requestTopPage"):
        print("Request top page called.")
        topPage2 = {
            "key" : "1",
            "meta" : {},
            "type" : "page",
            "value" : [
                {
                    "key" : "2",
                    "meta" : {},
                    "type" : "text",
                    "value" : "Hello, world!"
                }
            ]
        }
        return json.dumps({
            "selector" : "renderPage:",
            "arguments" : [defaultPage()]
        })
    
    return None

async def hello(websocket, path):
    print("Connection at path: " + path)
    while True:
        # While loop broken when recv() throws ConnectionClosed
        message = await websocket.recv()

        print("Message: " + message)
        
        result = await consumer(json.loads(message))
        if result != None:
            await websocket.send(result)

async def test():
    input('awef')

async def wakeup():
    while True:
        await asyncio.sleep(1)

class Kernel:
    def __init__(self):
        pass

    def run(self):
        print("Running!")

if __name__ == "__main__":
    k = Kernel()
    k.run()

    start_server = websockets.serve(hello, 'localhost', 8085)

    asyncio.get_event_loop().create_task(wakeup())
    asyncio.get_event_loop().run_until_complete(start_server)

    try:
        asyncio.get_event_loop().run_forever()
    except KeyboardInterrupt as ex:
        print("Keyboard interrupt")

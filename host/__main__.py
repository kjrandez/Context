import asyncio
import kernel
import filesystem

async def periodic():
    while True:
        await asyncio.sleep(0.2)

if __name__ == "__main__":
    try:
        loop = asyncio.get_event_loop()
        kernel.Kernel(loop)
        loop.create_task(periodic())
        loop.run_forever()
    except KeyboardInterrupt:
        raise

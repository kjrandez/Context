import asyncio
from kernel import Kernel


async def periodic() -> None:
    while True:
        await asyncio.sleep(0.2)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    k = Kernel(loop)

    try:
        k.asyncThreadEntry(loop)
        loop.create_task(periodic())
        loop.run_forever()
    except KeyboardInterrupt:
        k.asyncThreadExit()
        raise

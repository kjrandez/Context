import asyncio

from .kernel import Kernel


async def periodic() -> None:
    while True:
        await asyncio.sleep(0.2)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    kernel = Kernel(loop)

    try:
        loop.create_task(periodic())
        kernel.run()
    except KeyboardInterrupt:
        kernel.halted()
        raise

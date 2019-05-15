import asyncio
import kernel
import threading
from typing import Awaitable


async def periodic() -> Awaitable[None]:
    while True:
        await asyncio.sleep(0.2)


def asyncThread(k: kernel.Kernel, loop: asyncio.AbstractEventLoop) -> None:
    """ Asyncio thread calls into kernel, runs event loop forever, breaks on Ctrl-C (for win). """
    try:
        asyncio.set_event_loop(loop)
        k.asyncThreadEntry(loop)
        loop.create_task(periodic())
        loop.run_forever()
    except KeyboardInterrupt:
        k.asyncThreadExit()
        raise


if __name__ == "__main__":
    """ Instantiates kernel in main thread, and passes instance to asyncio thread. """
    k = kernel.Kernel()
    loop = asyncio.get_event_loop()
    threading.Thread(target=asyncThread, args=(k, loop)).start()
    k.workThreadEntry()

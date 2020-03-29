import time
from context import Client

if __name__ == "__main__":
    hostService = Client().connect()
    print(hostService)

    while True:
        print(hostService.callBlocking("ping", []))
        time.sleep(0.25)

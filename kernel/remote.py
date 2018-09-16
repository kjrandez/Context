import json
from model import topPage

async def dispatch(msg):
    if(msg["selector"] == "requestTopPage"):
        print("Request top page called")
        return json.dumps({
            "selector" : "renderPage:",
            "arguments" : [topPage.model()]
        })
    else:
        return None

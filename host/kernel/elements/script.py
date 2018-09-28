import traceback
from threading import Thread
from .text import Text

class Script(Text):
    def __init__(self, content = ""):
        super().__init__(content)

    def typeName(self):
        return "script"

    def execute(self, page):
        try:
            exec(self.content, globals(), locals())
        except:
            trace = traceback.format_exc()
            print("Runtime error in script")
            print(trace)

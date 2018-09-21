import traceback
from threading import Thread
from .text import Text

class Script(Text):
    def __init__(self, content = ""):
        super().__init__(content)

    def typeName(self):
        return "script"

    def execute(self, page, newThread):
        code = self.content

        if newThread:
            print("Starting thread")
            Thread(target = self.runExec, args = (page, code)).start()
        else:
            self.runExec(page, code)

    def runExec(self, page, code):
        try:
            exec(code, globals(), locals())
        except:
            trace = traceback.format_exc()
            print("Runtime error in script")
            print(trace)

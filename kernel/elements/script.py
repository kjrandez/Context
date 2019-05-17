import traceback

from .text import Text

class Script(Text):
    def __init__(self, content = ""):
        super().__init__(content)

    def duplicate(self, memo):
        return Script(self.content)

    def execute(self, page):
        try:
            exec(self.content, globals(), locals())
        except:
            trace = traceback.format_exc()
            print("Runtime error in script")
            print(trace)

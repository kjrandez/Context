from .text import Text

class Script(Text):
    def __init__(self, content = ""):
        super().__init__(content)

    def typeName(self):
        return "script"

    def localExec(self, page):
        exec(self.content, globals(), locals())

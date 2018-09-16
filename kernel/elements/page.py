from .element import Element

class Page(Element):
    def __init__(self, content = [], column = False):
        super().__init__("page")
        self.content = content
        self.column = column
    
    def value(self):
        return {
            "content" : [x.model() for x in self.content],
            "column" : self.column
        }

    def localExec(self, code):
        exec(code, globals(), locals())
    
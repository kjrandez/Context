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
    
    def append(self, inst):
        self.content.append(inst)
    
    def insertAt(self, inst, index):
        self.content.insert(inst, index)
    
    def remove(self, inst):
        self.content.remove(inst)
    
    def removeAt(self, index):
        self.content.pop(index)

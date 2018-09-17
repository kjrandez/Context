from .element import Element

class Page(Element):
    def __init__(self, observer, content = [], column = False):
        super().__init__(observer, "page")
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
        self.notify()
    
    def insertAt(self, inst, index):
        self.content.insert(inst, index)
        self.notify()
    
    def remove(self, inst):
        self.content.remove(inst)
        self.notify()
    
    def removeAt(self, index):
        self.content.pop(index)
        self.notify()

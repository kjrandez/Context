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
        trans = self.transaction("append")
        trans.detail["inst"] = inst.key

        self.content.append(inst)

        trans.complete()
    
    def insertAt(self, inst, index):
        trans = self.transaction("insertAt")
        trans.detail["inst"] = inst.key
        trans.detail["index"] = index

        self.content.insert(inst, index)

        trans.complete()
    
    def remove(self, inst):
        trans = self.transaction("remove")
        trans.detail["inst"] = inst.key

        self.content.remove(inst)

        trans.complete()
    
    def removeAt(self, index):
        trans = self.transaction("removeAt")
        trans.detail["index"] = index

        self.content.pop(index)

        trans.complete()

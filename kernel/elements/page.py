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
    
    def append(self, inst, reverse = None):
        trans = self.transaction("append", reverse)
        trans.detail["inst"] = inst.key

        self.content.append(inst)

        trans.reverseOp = self.removeAt
        trans.reverseArgs = [len(self.content) - 1]
        return trans.complete()
    
    def insertAt(self, inst, index, reverse = None):
        trans = self.transaction("insertAt", reverse)
        trans.detail["inst"] = inst.key
        trans.detail["index"] = index

        self.content.insert(inst, index)

        trans.reverseOp = self.removeAt
        trans.reverseArgs = [index]
        return trans.complete()
    
    def remove(self, inst, reverse = None):
        trans = self.transaction("remove", reverse)
        trans.detail["inst"] = inst.key

        # Throws ValueError
        index = self.content.index(inst)
        self.content.remove(inst) 

        trans.reverseOp = self.insertAt
        trans.reverseArgs = [inst, index]
        return trans.complete()
    
    def removeAt(self, index, reverse = None):
        trans = self.transaction("removeAt", reverse)
        trans.detail["index"] = index

        # Throws IndexError
        inst = self.content.pop(index)

        trans.reverseOp = self.insertAt
        trans.reverseArgs = [inst, index]
        return trans.complete()

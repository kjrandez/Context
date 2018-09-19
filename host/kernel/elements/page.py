from .element import Element

class Page(Element):
    def __init__(self, content = [], column = False):
        super().__init__("page")
        self.content = content
        self.column = column
    
    def value(self):
        return {
            "content" : [x.key for x in self.content],
            "column" : self.column
        }

    def localExec(self, code):
        exec(code, globals(), locals())

    def flattened(self):
        entries = {self.key : self.model()}
        self.traverse(entries)
        return entries

    def traverse(self, entries = {}):
        for entry in self.content:
            if entry.key in entries:
                continue
            entries[entry.key] = entry.model()
            if isinstance(entry, Page):
                entry.traverse(entries)

    def append(self, inst, reverse = None):
        trans = self.transaction("append", reverse)
        trans.detail["inst"] = inst.key
        trans.reference(inst)

        self.content.append(inst)

        trans.reverseOp = self.removeAt
        trans.reverseArgs = [len(self.content) - 1]
        return trans.complete()
    
    def insertAt(self, inst, index, reverse = None):
        trans = self.transaction("insertAt", reverse)
        trans.detail["inst"] = inst.key
        trans.detail["index"] = index
        trans.reference(inst)
        
        self.content.insert(inst, index)

        trans.reverseOp = self.removeAt
        trans.reverseArgs = [index]
        return trans.complete()
    
    def remove(self, inst, reverse = None):
        trans = self.transaction("remove", reverse)
        trans.detail["inst"] = inst.key

        try:
            index = self.content.index(inst)
            self.content.remove(inst) 

            trans.reverseOp = self.insertAt
            trans.reverseArgs = [inst, index]
            return trans.complete()
        except ValueError:
            trans.cancel()
            raise
    
    def removeAt(self, index, reverse = None):
        trans = self.transaction("removeAt", reverse)
        trans.detail["index"] = index

        try:
            inst = self.content.pop(index)

            trans.reverseOp = self.insertAt
            trans.reverseArgs = [inst, index]
            return trans.complete()
        except IndexError:
            trans.cancel()
            raise

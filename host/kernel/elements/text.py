from .element import Element

class Text(Element):
    def __init__(self, content = ""):
        super().__init__()
        self.content = content
    
    def typeName(self):
        return "text"

    def value(self):
        return {
            "content" : self.content
        }

    def update(self, value, reverse = None):
        trans = self.transaction(reverse)

        prev = self.content
        self.content = value

        trans.reverseOp = self.update
        trans.reverseArgs = [prev]
        return trans.complete()

    def insert(self, value, start, reverse = None):
        trans = self.transaction(reverse)
        
        try:
            if (start < 0) or (start > len(self.content)):
                raise IndexError("Insertion starts out of range")

            prev = self.content
            self.content = prev[:start] + value + prev[start:]

            trans.reverseOp = self.remove
            trans.reverseArgs = [start, start + len(value)]
            return trans.complete()
        except IndexError:
            trans.cancel()
            raise

    def remove(self, start, stop, reverse = None):
        trans = self.transaction(reverse)

        try:
            if (start < 0) or (start > len(self.content)):
                raise IndexError("Removal starts out of range")
            if (stop < 0) or (stop > len(self.content)):
                raise IndexError("Removal stops out of range")
            if start > stop:
                raise IndexError("Removal start and stop are reversed")
            
            prev = self.content
            self.content = prev[:start] + prev[stop:]

            removed = prev[start:stop]
            trans.reverseOp = self.insert
            trans.reverseArgs = [removed, start]
            return trans.complete()
        except IndexError:
            trans.cancel()
            raise

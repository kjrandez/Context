from .element import Element

class Text(Element):
    def __init__(self, observer, content):
        super().__init__(observer, "text")
        self.content = content
    
    def value(self):
        return {
            "content" : self.content
        }

    def update(self, value, undo = False):
        trans = self.transaction("update", undo)
        trans.detail["value"] = value

        prev = self.content
        self.content = value

        trans.undo = self.update
        trans.undoArgs = [prev]
        return trans.complete()

    def insert(self, value, start, undo = False):
        trans = self.transaction("insert", undo)
        trans.detail["value"] = value
        
        # Throws IndexError
        if (start < 0) or (start > len(self.content)):
            raise IndexError("Insertion starts out of range")

        prev = self.content
        self.content = prev[:start] + value + prev[start:]

        trans.undo = self.remove
        trans.undoArgs = [start, start + len(value)]
        return trans.complete()

    def remove(self, start, stop, undo = False):
        trans = self.transaction("insert", undo)
        trans.detail["start"] = start
        trans.detail["stop"] = stop

        # Throws IndexError
        if (start < 0) or (start > len(self.content)):
            raise IndexError("Removal starts out of range")
        if (stop < 0) or (stop > len(self.content)):
            raise IndexError("Removal stops out of range")
        if start > stop:
            raise IndexError("Removal start and stop are reversed")
        
        prev = self.content
        self.content = prev[:start] + prev[stop:]

        removed = prev[start:stop]
        trans.undo = self.insert
        trans.undoArgs = [removed, start]
        return trans.complete()

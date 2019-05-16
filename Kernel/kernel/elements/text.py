from kernel.element import Element

class Text(Element):
    def __init__(self, content = ""):
        super().__init__()
        self.content = content

    def value(self):
        return {
            "content" : self.content
        }

    def duplicate(self, memo):
        return Text(self.content)

    def update(self, value, reverse = None):
        trans = self.transaction(reverse)

        prev = self.content
        self.content = value

        trans.reverseOp = self.update
        trans.reverseArgs = [prev]
        return trans.complete()

    def splice(self, start, stop, addition, reverse = None):
        trans = self.transaction(reverse)

        try:
            if (start < 0) or (start > len(self.content)):
                raise IndexError("Removal starts out of range")
            if (stop < 0) or (stop > len(self.content)):
                raise IndexError("Removal stops out of range")
            if start > stop:
                raise IndexError("Removal start and stop are reversed")
            
            prev = self.content
            self.content = prev[:start] + addition + prev[stop:]

            removed = prev[start:stop]
            trans.reverseOp = self.splice
            trans.reverseArgs = [start, start + len(addition), removed]
            return trans.complete()
        except IndexError:
            trans.cancel()
            raise

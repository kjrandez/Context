from ..element import Element


class Text(Element):
    def __init__(self, content: str):
        super().__init__()
        self.content = content

    def value(self) -> object:
        return {
            'content': self.content
        }

    def duplicate(self) -> Element:
        return Text(self.content)

    def update(self, value: str) -> None:
        trans = self.newTransaction()

        prev = self.content
        self.content = value

        trans.reverseOp = lambda: self.update(prev)

        self.completeTransaction(trans)

    def splice(self, start: int, stop: int, addition: str) -> None:
        trans = self.newTransaction()

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

            trans.reverseOp = lambda: self.splice(start, start + len(addition), removed)

            self.completeTransaction(trans)
        except IndexError:
            self.cancelTransaction(trans)
            raise

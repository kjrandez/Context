from ..element import Element


class Link(Element):
    def __init__(self, href: str):
        super().__init__()
        self.href = href

    def value(self) -> object:
        return {
            'href': self.href
        }

    def update(self, value: str) -> None:
        trans = self.newTransaction()

        prev = self.href
        self.href = value

        trans.reverseOp = lambda: self.update(prev)

        self.completeTransaction(trans)

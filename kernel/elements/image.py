from ..element import Element


class Image(Element):
    def __init__(self, src: str, alt: str):
        super().__init__()
        self.src = src
        self.alt = alt

    def value(self) -> object:
        return {
            'src': self.src,
            'alt': self.alt
        }
    
    def update(self, srcValue: str, altValue: str) -> None:
        trans = self.newTransaction()

        prevSrc = self.src
        prevAlt = self.alt
        self.src = srcValue
        self.alt = altValue

        trans.reverseOp = lambda: self.update(prevSrc, prevAlt)

        self.completeTransaction(trans)

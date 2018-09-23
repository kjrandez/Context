from .element import Element

class Image(Element):
    def __init__(self, src, alt):
        super().__init__()
        self.src = src
        self.alt = alt

    def typeName(self):
        return "image"

    def value(self):
        return {
            "src" : self.src,
            "alt" : self.alt
        }
    
    def update(self, srcValue, altValue, reverse = None):
        trans = self.transaction(reverse)

        prevSrc = self.src
        prevAlt = self.alt
        self.src = srcValue
        self.alt = altValue

        trans.reverseOp = self.update
        trans.reverseArgs = [prevSrc, prevAlt]
        return trans.complete()

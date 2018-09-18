from .element import Element

class Image(Element):
    def __init__(self, observer, src, alt):
        super().__init__(observer, "image")
        self.src = src
        self.alt = alt

    def value(self):
        return {
            "src" : self.src,
            "alt" : self.alt
        }
    
    def update(self, srcValue, altValue, reverse=None):
        trans = self.transaction("update", reverse)
        trans.detail["src"] = srcValue
        trans.detail["alt"] = altValue

        prevSrc = self.src
        prevAlt = self.alt
        self.src = srcValue
        self.alt = altValue

        trans.reverseOp = self.update
        trans.reverseArgs = [prevSrc, prevAlt]
        return trans.complete()

from element import Element

class Link(Element):
    def __init__(self, href = ""):
        super().__init__()
        self.href = href

    def value(self):
        return {
            "href" : self.href
        }

    def update(self, value, reverse = None):
        trans = self.transaction(reverse)

        prev = self.href
        self.href = value

        trans.reverseOp = self.update
        trans.reverseArgs = [prev]
        return trans.complete()

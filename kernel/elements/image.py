from .element import Element

class Image(Element):
    def __init__(self, src, alt):
        super().__init__("image")
        self.src = src
        self.alt = alt

    def value(self):
        return {
            "src" : self.src,
            "alt" : self.alt
        }

    
    
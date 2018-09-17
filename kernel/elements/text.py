from .element import Element

class Text(Element):
    def __init__(self, observer, content):
        super().__init__(observer, "text")
        self.content = content
    
    def value(self):
        return {
            "content" : self.content
        }

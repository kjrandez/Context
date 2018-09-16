from .element import Element

class Text(Element):
    def __init__(self, content):
        super().__init__("text")
        self.content = content
    
    def value(self):
        return {
            "content" : self.content
        }

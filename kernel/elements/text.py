from .element import Element

class Text(Element):
    def __init__(self, observer, content):
        super().__init__(observer, "text")
        self.content = content
    
    def value(self):
        return {
            "content" : self.content
        }

    def update(self, value):
        trans = self.transaction("update")
        trans.detail["value"] = value

        self.content = value

        trans.complete()

    def insert(self, value, start):
        trans = self.transaction("insert")
        trans.detail["value"] = value

        prev = self.content
        self.content = prev[:start] + value + prev[start:]

        trans.complete()

    def remove(self, start, stop):
        trans = self.transaction("insert")
        trans.detail["start"] = start
        trans.detail["stop"] = stop

        prev = self.content
        self.content = prev[:start] + prev[stop:]

        trans.complete()

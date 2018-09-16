class Element:
    nextKey = 0

    def __init__(self, type):
        self.key = Element.nextKey
        self.type = type

        Element.nextKey = Element.nextKey + 1

    def value(self):
        return None

    def model(self):
        return {
            "key" : self.key,
            "type" : self.type,
            "value" : self.value()
        }

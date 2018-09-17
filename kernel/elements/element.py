class Element:
    nextKey = 0

    def __init__(self, observer, type):
        self.key = Element.nextKey
        self.type = type
        self.observer = observer

        Element.nextKey = Element.nextKey + 1

    def value(self):
        return None

    def model(self):
        return {
            "key" : self.key,
            "type" : self.type,
            "value" : self.value()
        }

    def notify(self):
        if self.observer != None:
            self.observer(self)

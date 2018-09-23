from ..core import Dataset, Transaction

class Element:
    nextId = 0

    def __init__(self):
        self.id = Element.nextId
        Dataset.singleton.append(self)
        Element.nextId = Element.nextId + 1

    def isPage(self):
        return False

    def value(self):
        return None

    def model(self):
        return {
            "id" : self.id,
            "type" : type(self).__name__,
            "value" : self.value()
        }

    def transaction(self, ttype, reverse):
        return Transaction(Dataset.singleton.observer, self, ttype, reverse)

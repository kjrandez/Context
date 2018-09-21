from ..core import Dataset, Transaction

class Element:
    nextKey = 0

    def __init__(self):
        self.key = Element.nextKey
        Dataset.singleton.append(self)
        Element.nextKey = Element.nextKey + 1

    def isPage(self):
        return False

    def value(self):
        return None

    def model(self):
        return {
            "key" : self.key,
            "type" : type(self).__name__,
            "value" : self.value()
        }

    def transaction(self, ttype, reverse):
        return Transaction(Dataset.singleton.observer, self, ttype, reverse)

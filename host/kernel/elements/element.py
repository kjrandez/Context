from ..core import transaction
from ..core import dataset

class Element:
    nextKey = 0

    def __init__(self, etype):
        self.key = Element.nextKey
        self.etype = etype

        dataset.gdata().append(self)
        Element.nextKey = Element.nextKey + 1

    def value(self):
        return None

    def model(self):
        return {
            "key" : self.key,
            "type" : self.etype,
            "value" : self.value()
        }

    def transaction(self, ttype, reverse):
        return transaction.Transaction(dataset.gdata().observer, self, ttype, reverse)

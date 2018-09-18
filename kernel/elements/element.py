from .transaction import Transaction

class Element:
    nextKey = 0
    nextTrans = 0

    def __init__(self, observer, etype):
        self.key = Element.nextKey
        self.etype = etype
        self.observer = observer

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
        return Transaction(self.observer, self, ttype, reverse)

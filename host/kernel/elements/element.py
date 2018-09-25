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

    def flatten(self, entries = {}, notAlreadyPresent = None):
        """ Incorporate my own model and any models under this hierarchy into 'entries' """
        if self.id not in entries:
            myModel = self.model()
            entries[self.id] = myModel
            if notAlreadyPresent != None:
                notAlreadyPresent(myModel)
        return entries
    
    def transaction(self, reverse):
        return Transaction(Dataset.singleton.observer, self, reverse)

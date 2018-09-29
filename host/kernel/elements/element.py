from ..core import Dataset, Transaction

class Element:
    nextId = 0

    def __init__(self):
        self.id = Element.nextId
        Dataset.singleton.append(self)
        Element.nextId = Element.nextId + 1

    def __deepcopy__(self, memo):
        return self.duplicate(memo)

    def backgroundInit(self):
        pass

    def duplicate(self, memo):
        return self
    
    def value(self):
        return None

    def model(self):
        return {
            "id" : self.id,
            "type" : type(self).__name__,
            "value" : self.value()
        }

    def flatten(self, flattened = None, notPresent = None, maxDepth = None, depth = 0):
        """ Incorporate my own model and any models under this hierarchy into 'flattened' """
        if flattened == None:
            flattened = {}
        
        if self.id not in flattened:
            myModel = self.model()
            flattened[self.id] = myModel
            if notPresent != None:
                notPresent(myModel)
        
        return flattened
    
    def transaction(self, reverse):
        return Transaction(Dataset.singleton.observer, self, reverse)

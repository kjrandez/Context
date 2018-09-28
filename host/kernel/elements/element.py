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

    def flatten(self, modelsSoFar = None, notAlreadyPresent = None):
        """ Incorporate my own model and any models under this hierarchy into 'modelsSoFar' """
        if modelsSoFar == None:
            modelsSoFar = {}
        
        if self.id not in modelsSoFar:
            myModel = self.model()
            modelsSoFar[self.id] = myModel
            if notAlreadyPresent != None:
                notAlreadyPresent(myModel)
        
        return modelsSoFar
    
    def transaction(self, reverse):
        return Transaction(Dataset.singleton.observer, self, reverse)

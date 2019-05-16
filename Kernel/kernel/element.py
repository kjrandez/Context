from typing import Optional, List, Dict, Any

# Observer interface is defined so that element module does not have to import anything, the
# module which fulfills the IObserver contract can import element and set the global instance

class IObserver:
    singleton: Optional['IObserver'] = None

    def elementCreated(self, inst: 'Element') -> int:
        pass

    def transactionStarted(self, trans: 'Transaction') -> int:
        pass

    def transactionCompleted(self, trans: 'Transaction') -> None:
        pass


def setGlobalObserver(observer: IObserver) -> None:
    IObserver.singleton = observer


class Element:
    def __init__(self) -> None:
        self.id: Optional[int] = None
        self.observer: Optional[IObserver] = None

        if IObserver.singleton is not None:
            self.observer = IObserver.singleton
            self.id = self.observer.elementCreated(self)

    def __deepcopy__(self, memo) -> 'Element':
        return self.duplicate(memo)

    def backgroundInit(self):
        pass

    def duplicate(self, memo):
        return self

    def value(self):
        return None

    def type(self):
        return type(self).__name__

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
    
    def newTransaction(self) -> 'Transaction':
        return Transaction(self)

    def completeTransaction(self, trans: 'Transaction') -> None:
        if self.observer is not None:
            self.observer.transactionCompleted(trans)



class Transaction:
    def __init__(self, element: Element) -> None:
        self.element = element
        self.others: List[Element] = []

        self.id: Optional[int] = None
        if IObserver.singleton is not None:
            self.id = IObserver.singleton.transactionStarted(self)

    def reference(self, element: Element) -> None:
        self.others.append(element)

    def model(self) -> Dict[str, Any]:
        return {
            'index': self.id,
            'id': self.element.id
        }


from typing import Optional, Callable, List, Dict


class IObserver:

    """ Observer interface is defined so that the application code can import the elements
        without elements needing to import application code, preventing import cycles. """

    singleton: Optional['IObserver'] = None

    def elementCreated(self, inst: 'Element') -> int:
        pass

    def transactionStarted(self, trans: 'Transaction') -> int:
        pass

    def transactionCompleted(self, trans: 'Transaction') -> None:
        pass


def setGlobalObserver(observer: IObserver) -> None:
    IObserver.singleton = observer


Model = Dict[str, object]


class Element:
    def __init__(self) -> None:
        self.id: Optional[int] = None
        self.observer: Optional[IObserver] = None

        if IObserver.singleton is not None:
            self.observer = IObserver.singleton
            self.id = self.observer.elementCreated(self)

    def __deepcopy__(self, memo: object) -> 'Element':
        return self.duplicate(memo)

    def backgroundInit(self) -> None:
        pass

    def duplicate(self, memo: object) -> 'Element':
        return self  # ???

    def value(self) -> object:
        return None

    def type(self) -> str:
        return type(self).__name__

    def model(self) -> Model:
        return {
            'id': self.id,
            'type': type(self).__name__,
            'value': self.value()
        }

    def flatten(
            self, flattened: Optional[Dict[int, Model]] = None,
            notPresent: Optional[Callable[[Model], None]] = None,
            maxDepth: Optional[int] = None, depth: int = 0) -> Dict[int, Model]:

        """ Incorporate my own model and any models under this hierarchy into 'flattened' """

        if flattened is None:
            flattened = {}

        if (self.id is not None) and (self.id not in flattened):
            myModel = self.model()
            flattened[self.id] = myModel
            if notPresent is not None:
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

    def model(self) -> Model:
        return {
            'index': self.id,
            'id': self.element.id
        }

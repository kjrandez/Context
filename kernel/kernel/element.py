from typing import Optional, Callable, List, Dict, cast


class IObserver:

    """ Observer interface is defined so that the kernel code can import the elements
        without elements needing to import kernel code, preventing import cycles. """

    singleton: Optional['IObserver'] = None

    def elementCreated(self, inst: 'Element') -> int:
        pass

    def transactionStarted(self, trans: 'Transaction') -> int:
        pass

    def transactionCancelled(self, trans: 'Transaction') -> None:
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

    def __deepcopy__(self) -> 'Element':
        return self.duplicate()

    def backgroundInit(self) -> None:
        pass

    def duplicate(self) -> 'Element':
        return self  # ???

    def value(self) -> object:
        return None

    def type(self) -> str:
        return type(self).__name__

    def model(self) -> Model:
        return {
            'id': self.id,
            'type': self.type(),
            'value': self.value()
        }

    def newTransaction(self) -> 'Transaction':
        return Transaction(self)

    def cancelTransaction(self, trans: 'Transaction') -> None:
        if self.observer is not None:
            self.observer.transactionCancelled(trans)

    def completeTransaction(self, trans: 'Transaction') -> None:
        trans.result(self.value())

        if self.observer is not None:
            self.observer.transactionCompleted(trans)


class Transaction:
    def __init__(self, element: Element) -> None:
        self.element = element
        self.others: List[Element] = []
        self.reverseOp: Callable[[], None]
        self.id: Optional[int] = None
        self.value: Optional[object] = None

        if IObserver.singleton is not None:
            self.id = IObserver.singleton.transactionStarted(self)

    def reference(self, element: Element) -> None:
        self.others.append(element)

    def result(self, value: object) -> None:
        self.value = value

    def model(self) -> Model:
        return {
            'id': self.id,
            'subject': self.element,
            'others': self.others,
            'value': self.value
        }

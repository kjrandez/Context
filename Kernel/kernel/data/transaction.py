from kernel.data import Ledger
from kernel.elements import Element


class Transaction:
    nextIndex = 0

    def __init__(self, observer: Ledger, element: Element, reverse) -> None:
        self.element = element
        self.others = []
        self.reverse = reverse
        self.observer = observer
        self.detail = {}

        self.index = Transaction.nextIndex
        Transaction.nextIndex = Transaction.nextIndex + 1

        self.observer.begin(self)

    def reference(self, element: Element):
        self.others.append(element)

    def model(self):
        return {
            'index': self.index,
            'id': self.element.id
        }

    def cancel(self):
        self.observer.cancel(self)

    def complete(self):
        self.observer.complete(self)
        return self.index

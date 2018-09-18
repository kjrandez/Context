class Transaction:
    nextIndex = 0

    def __init__(self, observer, element, ttype, reverse):
        self.index = Transaction.nextIndex
        self.element = element
        self.ttype = ttype
        self.reverse = reverse
        self.observer = observer
        self.detail = {}

        Transaction.nextIndex = Transaction.nextIndex + 1

    def model(self):
        return {
            "index" : self.index,
            "key" : self.element.key,
            "type" : self.ttype,
            "detail" : self.detail
        }

    def complete(self):
        self.observer(self)

class Transaction:
    nextIndex = 0

    def __init__(self, observer, element, ttype, reverse):
        self.element = element
        self.others = []
        self.ttype = ttype
        self.reverse = reverse
        self.observer = observer
        self.detail = {}

        self.index = Transaction.nextIndex
        Transaction.nextIndex = Transaction.nextIndex + 1
        
        self.observer.begin(self)

    def reference(self, element):
        self.others.append(element)

    def model(self):
        return {
            "index" : self.index,
            "key" : self.element.key,
            "type" : self.ttype,
            "detail" : self.detail
        }

    def cancel(self):
        self.observer.cancel(self)

    def complete(self):
        self.observer.complete(self)
        return self.index

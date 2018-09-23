from .element import Element

class PageEntry():
    nextKey = 0

    def __init__(self, element):
        self.element = element
        self.key = PageEntry.nextKey
        PageEntry.nextKey = PageEntry.nextKey + 1

    def __eq__(self, other):
        if isinstance(other, PageEntry):
            return self.key == other.key
        elif isinstance(other, int):
            return self.key == other
        else:
            return self.element == other
    
    def __ne__(self, other):
        return not self.__eq__(other)

class Page(Element):
    def __init__(self, content = [], column = False):
        super().__init__()
        self.content = [resolvedEntry(x) for x in content]
        self.column = column

    def typeName(self):
        return "page"

    def value(self):
        """return {
            "content" : [{"key" : x.key, "element" : x.element.id} for x in self.content],
            "column" : self.column
        }"""
        return {
            "content" : [x.element.id for x in self.content],
            "column" : self.column
        }
    
    def flattened(self):
        """ Returns a dictionary of the models of every element in this hierarchy including self """
        entries = {self.id : self.model()}
        self.traverse(entries)
        return entries

    def traverse(self, entries = {}):
        """ Adds the model of each page entry to the dictionary, recursing into other pages """
        for entry in self.content:
            element = entry.element
            if element.id in entries:
                continue
            entries[element.id] = element.model()
            if isinstance(element, Page):
                element.traverse(entries)

    def elements(self):
        """ Returns a list of elements corresponding to the page's entries. """
        return [x.element for x in self.content]

    def append(self, inst, reverse = None):
        """ Trans: Appends an element to the end of the Page """
        trans = self.transaction("append", reverse)
        trans.detail["inst"] = inst.id
        trans.reference(inst)

        entry = PageEntry(inst)
        self.content.append(entry)

        trans.reverseOp = self.remove
        trans.reverseArgs = [entry]
        return trans.complete()
    
    def insertBefore(self, inst, keyEntryOrElement, reverse = None):
        """ Trans: Inserts an element before the entry or first element instance """
        pass

    def insertAfter(self, inst, keyEntryOrElement, reverse = None):
        """ Trans: Inserts an element after the entry or first element instance """
        pass
    
    def insertAt(self, inst, offset, reverse = None):
        """ Trans: Insert an element at the specified offset """

    def remove(self, keyEntryOrElement, reverse = None):
        """ Trans: Removes the entry or first element instance """
        pass
    
    def removeAt(self, offset, reverse = None):
        """ Trans: Removes the entry at the specified offset """
        pass

def resolvedEntry(item):
    """ Returns the argument if it is a PageEntry, otherwise a PageEntry of the element """
    if isinstance(item, PageEntry):
        return item
    return PageEntry(item)
from .element import Element
import copy

class PageEntry():
    nextKey = 0

    def __init__(self, element):
        self.element = element
        self.key = PageEntry.nextKey

        PageEntry.nextKey = PageEntry.nextKey + 1

    def model(self):
        return {"key" : self.key, "element" : self.element.id}

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
        self.latestEntry = None
        self.column = column

    def duplicate(self, memo):
        dupContent = [copy.deepcopy(entry.element, memo) for entry in self.content]
        return Page(dupContent, self.column)

    def value(self):
        result = {
            "content" : [x.model() for x in self.content],
            "latestEntry" : self.latestEntry.model() if (self.latestEntry != None) else None,
            "column" : self.column
        }
        return result
    
    def flatten(self, flattened = None, notPresent = None, maxDepth = None, depth = 0):
        """ Incorporate my own model and any models under this hierarchy into the dictionary """
        flattened = super().flatten(flattened, notPresent)
        
        # Do not go deeper if this is the max depth
        if (maxDepth != None) and (depth == maxDepth):
            return flattened

        for entry in self.content:
            entry.element.flatten(flattened, notPresent, maxDepth, depth + 1)
        
        return flattened

    def elements(self):
        """ Returns a list of elements corresponding to the page's entries. """
        return [x.element for x in self.content]

    def find(self, keyEntryOrElement):
        """ Returns the offset of the specified entry or first element instance """
        return self.content.index(keyEntryOrElement)

    def append(self, inst, noteEntry = False, reverse = None):
        """ Trans: Appends an element to the end of the Page """
        trans = self.transaction(reverse)
        trans.reference(inst)

        entry = PageEntry(inst)
        self.content.append(entry)
        if(noteEntry):
            self.latestEntry = entry

        trans.reverseOp = self.remove
        trans.reverseArgs = [entry]
        return trans.complete()

    def insertBefore(self, inst, keyEntryOrElement, noteEntry = False, reverse = None):
        """ Trans: Inserts an element before the entry or first element instance """
        trans = self.transaction(reverse)
        trans.reference(inst)

        try:
            offset = self.content.index(keyEntryOrElement)
            entry = PageEntry(inst)
            self.content.insert(offset, entry)
            if(noteEntry):
                self.latestEntry = entry
            
            trans.reverseOp = self.remove
            trans.reverseArgs = [entry]
            return trans.complete()
        except:
            trans.cancel()
            raise

    def insertAfter(self, inst, keyEntryOrElement, noteEntry = False, reverse = None):
        """ Trans: Inserts an element after the entry or first element instance """
        trans = self.transaction(reverse)
        trans.reference(inst)

        try:
            offset = self.content.index(keyEntryOrElement)
            entry = PageEntry(inst)
            self.content.insert(offset + 1, entry)
            if(noteEntry):
                self.latestEntry = entry
            
            trans.reverseOp = self.remove
            trans.reverseArgs = [entry]
            return trans.complete()
        except:
            trans.cancel()
            raise
        
    def insertAt(self, inst, offset, noteEntry = False, reverse = None):
        """ Trans: Insert an element at the specified offset """
        trans = self.transaction(reverse)
        trans.reference(inst)

        try:
            entry = PageEntry(inst)
            self.content.insert(offset, entry)
            if(noteEntry):
                self.latestEntry = entry
            
            trans.reverseOp = self.remove
            trans.reverseArgs = [entry]
            return trans.complete()
        except:
            trans.cancel()
            raise

    def remove(self, keyEntryOrElement, reverse = None):
        """ Trans: Removes the entry or first element instance """
        trans = self.transaction(reverse)
        
        try:
            offset = self.content.index(keyEntryOrElement)
            entry = self.content.pop(offset)

            trans.reverseOp = self.insertAt
            trans.reverseArgs = [entry.element, offset]
            return trans.complete()
        except:
            trans.cancel()
            raise
    
    def removeAt(self, offset, reverse = None):
        """ Trans: Removes the entry at the specified offset """
        trans = self.transaction(reverse)

        try:
            entry = self.content.pop(offset)

            trans.reverseOp = self.insertAt
            trans.reverseArgs = [entry.element, offset]
            return trans.complete()
        except:
            trans.cancel()
            raise

def resolvedEntry(item):
    """ Returns the argument if it is a PageEntry, otherwise a PageEntry of the element """
    if isinstance(item, PageEntry):
        return item
    return PageEntry(item)
import copy
from typing import List, Dict, Any, Optional, Union

from ..element import Element


class PageEntry:
    nextKey = 0

    def __init__(self, element: Element) -> None:
        self.element = element
        self.key = PageEntry.nextKey

        PageEntry.nextKey = PageEntry.nextKey + 1

    def model(self) -> Dict[str, Any]:
        return {'key': self.key, 'element': self.element.id}

    def __eq__(self, other: 'PageEntry') -> bool:
        if isinstance(other, PageEntry):
            return self.key == other.key
        elif isinstance(other, int):
            return self.key == other
        else:
            return self.element == other

    def __ne__(self, other: 'PageEntry') -> bool:
        return not self.__eq__(other)


class Page(Element):
    def __init__(self, content: List[Element] = None, column: bool = False) -> None:
        super().__init__()
        if content is None:
            content = []
        self.content = [resolvedEntry(x) for x in content]
        self.latestEntry = None
        self.column = column

    def duplicate(self, memo: Dict[Any, Any]) -> 'Page':
        dupContent = [copy.deepcopy(entry.element, memo) for entry in self.content]
        return Page(dupContent, self.column)

    def value(self) -> Dict[str, Any]:
        result = {
            'content': [x.model() for x in self.content],
            'latestEntry': self.latestEntry.model() if (self.latestEntry is not None) else None,
            'column': self.column,
            'traversalDepth': 0
        }
        return result
    
    def flatten(
            self, flattened: Dict[int, Dict[str, Any]] = None,
            notPresent: bool = None, maxDepth: Optional[int] = None, depth: int = 0):
        if self.id in flattened:
            prevDepth = flattened[self.id]['value']['traversalDepth']
            if (prevDepth is None) or (prevDepth >= maxDepth):
                return
        
        """ Incorporate my own model and any models under this hierarchy into the dictionary """
        flattened = super().flatten(flattened, notPresent)
        
        if (maxDepth is not None) and (depth == maxDepth):
            return flattened
        else:
            flattened[self.id]['value']['traversalDepth'] = maxDepth
        
        for entry in self.content:
            entry.element.flatten(flattened, notPresent, maxDepth, depth + 1)
        
        return flattened

    def elements(self) -> List[Element]:
        """ Returns a list of elements corresponding to the page's entries. """
        return [x.element for x in self.content]

    def find(self, keyEntryOrElement: Union[int, Element]) -> int:
        """ Returns the offset of the specified entry or first element instance """
        return self.content.index(keyEntryOrElement)

    def append(self, inst: Element, noteEntry: bool = False, reverse=None):
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
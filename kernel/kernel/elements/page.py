import copy
from typing import List, Dict, Optional, Union, cast

from ..element import Element, Model


class PageEntry:
    nextKey = 0

    def __init__(self, element: Element) -> None:
        self.element = element
        self.key = PageEntry.nextKey

        PageEntry.nextKey = PageEntry.nextKey + 1

    def model(self) -> Model:
        return {'key': self.key, 'element': self.element}

    def __eq__(self, other: object) -> bool:
        if isinstance(other, PageEntry):
            return self.key == other.key
        elif isinstance(other, int):
            return self.key == other
        else:
            return self.element == other

    def __ne__(self, other: object) -> bool:
        return not self.__eq__(other)


# For the time being, page entry indices and Elements (first occurrence) can be compared
# to PageEntries in order to find their location in the page content
PageEntryComparable = Union[int, PageEntry, Element]


class Page(Element):
    def __init__(self, content: List[Element]) -> None:
        super().__init__()
        self.content: List[PageEntry] = [resolvedEntry(x) for x in content]
        self.latestEntry: Optional[PageEntry] = None

    def duplicate(self) -> 'Page':
        dupContent = [copy.deepcopy(entry.element) for entry in self.content]
        return Page(dupContent)

    def value(self) -> object:
        return {
            'content': [x.model() for x in self.content],
            'latestEntry': self.latestEntry.model() if (self.latestEntry is not None) else None
        }

    def elements(self) -> List[Element]:
        """ Returns a list of elements corresponding to the page's entries. """

        return [x.element for x in self.content]

    def find(self, keyEntryOrElement: PageEntryComparable) -> int:
        """ Returns the offset of the specified entry or first element instance """

        bogus = cast(PageEntry, keyEntryOrElement)
        return self.content.index(bogus)

    def append(self, inst: Element, noteEntry: bool = False) -> None:
        """ Trans: Appends an element to the end of the Page """

        trans = self.newTransaction()
        trans.reference(inst)

        entry = PageEntry(inst)
        self.content.append(entry)
        if noteEntry:
            self.latestEntry = entry

        trans.reverseOp = lambda: self.remove(entry)

        self.completeTransaction(trans)

    def insertBefore(
            self, inst: Element, keyEntryOrElement: PageEntryComparable,
            noteEntry: bool = False) -> None:

        """ Trans: Inserts an element before the entry or first element instance """

        trans = self.newTransaction()
        trans.reference(inst)

        try:
            entry = PageEntry(inst)
            offset = self.find(keyEntryOrElement)
            self.content.insert(offset, entry)
            if noteEntry:
                self.latestEntry = entry

            trans.reverseOp = lambda: self.remove(entry)

            self.completeTransaction(trans)

        except ValueError:
            self.cancelTransaction(trans)
            raise

    def insertAfter(
            self, inst: Element, keyEntryOrElement: PageEntryComparable,
            noteEntry: bool = False) -> None:

        """ Trans: Inserts an element after the entry or first element instance """

        trans = self.newTransaction()
        trans.reference(inst)

        try:
            entry = PageEntry(inst)
            offset = self.find(keyEntryOrElement)
            self.content.insert(offset + 1, entry)
            if noteEntry:
                self.latestEntry = entry
            
            trans.reverseOp = lambda: self.remove(entry)

            self.completeTransaction(trans)

        except ValueError:
            self.cancelTransaction(trans)
            raise
        
    def insertAt(self, inst: Element, offset: int, noteEntry: bool = False) -> None:
        """ Trans: Insert an element at the specified offset """

        trans = self.newTransaction()
        trans.reference(inst)

        entry = PageEntry(inst)
        self.content.insert(offset, entry)
        if noteEntry:
            self.latestEntry = entry

        trans.reverseOp = lambda: self.remove(entry)

        self.completeTransaction(trans)

    def remove(self, keyEntryOrElement: PageEntryComparable) -> None:
        """ Trans: Removes the entry or first element instance """

        trans = self.newTransaction()
        
        try:
            offset = self.find(keyEntryOrElement)
            entry = self.content.pop(offset)

            trans.reverseOp = lambda: self.insertAt(entry.element, offset)

            self.completeTransaction(trans)

        except (ValueError, IndexError):
            self.cancelTransaction(trans)
            raise
    
    def removeAt(self, offset: int) -> None:
        """ Trans: Removes the entry at the specified offset """

        trans = self.newTransaction()

        try:
            entry = self.content.pop(offset)

            trans.reverseOp = lambda: self.insertAt(entry.element, offset)

            self.completeTransaction(trans)

        except IndexError:
            self.cancelTransaction(trans)
            raise


def resolvedEntry(item: Element) -> PageEntry:
    """ Returns the argument if it is a PageEntry, otherwise a PageEntry of the element """

    if isinstance(item, PageEntry):
        return item

    return PageEntry(item)

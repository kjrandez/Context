from typing import List
from kernel.element import Element
from kernel.elements.page import Page

class Clipboard(Page):
    def __init__(self, content: List[Element] = None, column: bool = False) -> None:
        super().__init__(content, column)

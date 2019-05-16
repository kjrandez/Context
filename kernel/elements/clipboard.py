from typing import List
from element import Element
from elements.page import Page

class Clipboard(Page):
    def __init__(self, content: List[Element] = None, column: bool = False) -> None:
        super().__init__(content, column)

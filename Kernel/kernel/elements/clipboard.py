from typing import List
from kernel.elements import Element, Page

class Clipboard(Page):
    def __init__(self, content: List[Element] = None, column: bool = False) -> None:
        super().__init__(content, column)

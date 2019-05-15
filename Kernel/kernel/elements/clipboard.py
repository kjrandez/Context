from typing import List

from kernel.elements import Element, Page


class Clipboard(Page):
    def __init__(self, content: List[Element] = [], column: bool = False):
        super().__init__(content, column)

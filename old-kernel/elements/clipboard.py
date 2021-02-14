from typing import List

from ..element import Element
from .page import Page


class Clipboard(Page):
    def __init__(self, content: List[Element]) -> None:
        super().__init__(content)

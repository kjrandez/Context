import traceback

from ..element import Element
from .text import Text
from .page import Page


class Script(Text):
    def __init__(self, content: str):
        super().__init__(content)

    def duplicate(self) -> Element:
        return Script(self.content)

    def execute(self, page: Page) -> None:
        # noinspection PyBroadException
        try:
            exec(self.content, globals(), locals())
        except Exception:
            trace = traceback.format_exc()
            print("Runtime error in script")
            print(trace)

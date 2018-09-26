from .page import Page

class Pasteboard(Page):
    def __init__(self, content = [], column = False):
        super().__init__(content, column)

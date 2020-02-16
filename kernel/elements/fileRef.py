import os
import subprocess
from typing import Any, IO

from ..element import Element


class FileRef(Element):
    def __init__(self, path: str):
        super().__init__()
        self.path = path

    def value(self) -> object:
        return {
            'path': self.path,
            'filename': os.path.basename(self.path)
        }

    def update(self, value: str) -> None:
        trans = self.newTransaction()

        prev = self.path
        self.path = value

        trans.reverseOp = lambda: self.update(prev)

        self.completeTransaction(trans)

    def openInExplorer(self) -> None:
        path = self.path.replace('/', '\\')
        subprocess.Popen('explorer /select,"' + path + '"')

    def openInDefault(self) -> None:
        os.startfile(self.path)

    def open(self, *args: Any) -> IO[Any]:
        return open(self.path, *args)

import os
import subprocess
from .element import Element

class FileRef(Element):
    def __init__(self, path = ""):
        super().__init__()
        self.path = path

    def value(self):
        return {
            "path" : self.path,
            "filename" : os.path.basename(self.path)
        }

    def update(self, value, reverse = None):
        trans = self.transaction(reverse)

        prev = self.path
        self.path = value

        trans.reverseOp = self.update
        trans.reverseArgs = [prev]
        return trans.complete()

    def openInExplorer(self):
        path = self.path.replace("/", "\\")
        subprocess.Popen('explorer /select,"' + path + '"')

    def openInDefault(self):
        os.startfile(self.path)

    def open(self, *args):
        return open(self.path, *args)
    
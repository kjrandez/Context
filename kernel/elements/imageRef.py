from .fileRef import FileRef

class ImageRef(FileRef):
    def __init__(self, path = ""):
        super().__init__(path)

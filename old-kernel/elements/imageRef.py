from .fileRef import FileRef


class ImageRef(FileRef):
    def __init__(self, path: str) -> None:
        super().__init__(path)

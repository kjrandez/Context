from typing import Optional, Dict

from .element import Element
from .elements.page import Page

lorem1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vestibulum at erat eget suscipit. Nulla rhoncus libero sapien, id molestie nibh luctus in. Pellentesque tristique nulla sit amet eros sodales, quis luctus enim congue. Integer placerat viverra sollicitudin. In libero ligula, interdum nec pellentesque non, elementum vel dolor. Aenean ut nisl vulputate, interdum urna eget, placerat enim. Vestibulum felis turpis, elementum ac malesuada id, lacinia at justo. In laoreet mauris et nibh ullamcorper convallis. Maecenas faucibus ipsum at congue scelerisque. Aliquam sem purus, pharetra suscipit condimentum quis, imperdiet at ex. Vestibulum maximus mattis odio, sed elementum dolor feugiat eget. Aliquam consectetur, neque vitae porta dictum, ante dui posuere libero, id euismod nisi dolor at ipsum.'  # noqa: E501
lorem2 = 'Maecenas vitae eros non lacus tincidunt ultrices sit amet id massa. Praesent pretium ante sit amet sapien suscipit eleifend. In hac habitasse platea dictumst. Nulla erat nisi, elementum vitae tempor ut, vehicula sit amet nibh. Vestibulum cursus fermentum enim, vel mollis augue sodales ut. Suspendisse in mattis justo. In eget ipsum blandit dolor ultricies euismod. Mauris sit amet massa maximus, placerat nisi nec, dignissim ipsum. Donec sodales id lectus sit amet pulvinar. Pellentesque sodales felis fringilla ultrices tincidunt. Phasellus vehicula lorem sed felis pulvinar, id porta mi commodo.'  # noqa: E501
lorem3 = 'Donec imperdiet id lectus eu hendrerit. Curabitur sodales libero sit amet eros venenatis, nec venenatis lacus bibendum. Ut aliquam convallis diam vitae interdum. Maecenas laoreet tempus pretium. Suspendisse ac dui tortor. Nulla rutrum fermentum dui ut gravida. Curabitur egestas erat ut ligula fermentum convallis. Nulla maximus, eros non semper mollis, lacus nulla ullamcorper risus, eu condimentum risus tellus eu est. In ut urna pulvinar, aliquet ligula pharetra, interdum nunc. Praesent dignissim vehicula arcu, et semper dolor porta vel. Maecenas semper porta gravida. Proin tortor augue, mattis ut luctus in, semper vitae nisi. Vivamus egestas, mi mollis elementum egestas, nibh sapien euismod justo, ac cursus metus risus id ante. Nam placerat velit ac orci ullamcorper, id dapibus odio bibendum.'  # noqa: E501


class Dataset:
    def __init__(self) -> None:
        self.objMap: Dict[int, Element] = {}
        self.root: Optional[Page] = None
        self.clipboard: Optional[Page] = None
        self.nextIndex = 1

    def lookup(self, instId: int) -> Optional[Element]:
        if instId in self.objMap:
            return self.objMap[instId]
        else:
            return None

    def append(self, inst: Element) -> int:
        assert inst.id is None

        newId = self.nextIndex
        self.nextIndex += 1

        self.objMap[newId] = inst
        return newId

    def loadExample(self) -> None:
        from .elements.text import Text
        from .elements.image import Image
        from .elements.script import Script
        from .elements.clipboard import Clipboard

        self.clipboard = Clipboard([])

        self.root = Page([
            Text("Hello world"),
            Text("How are you doing today?"),
            Text("I'm doing just fine thank you very much."),
            Script("print('Hello world!')"),
            Page([
                Text("Introduction"),
                Text(lorem1)
            ]),
            Page([
                Page([
                    Text("Mas informacion"),
                    Text(lorem2)
                ]),
                Page([
                    Text("[Scope_0]"),
                    Image('lol2.png', "Funny joke")
                ])
            ]),
            Page([
                Text(lorem3)
            ]),
            Image('sw.png', "Switching characteristics"),
            Page([
                Text("This is pretty funy if you actually think about it for a second."),
                Text("I really can't agree with that statement")
            ]),
            Text("Just to finish it off right here."),
            Text("Actually I'll go ahead and add a bit more to be sure...")
        ])

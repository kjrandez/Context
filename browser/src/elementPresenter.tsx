import Presenter from "./presenter";
import Proxy from "./proxy";

export default abstract class ElementPresenter extends Presenter
{
    element: Proxy;

    constructor(parentPath: Presenter[], key: number, element: Proxy) {
        super(parentPath, key);

        this.element = element;
        this.element.attach(this.path);
    }

    orphaned() {
        this.element.detach(this.path);
    }
}

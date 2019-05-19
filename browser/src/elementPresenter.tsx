import Presenter from "./presenter";
import { Proxy } from "./state";
import { AppState } from "./app";

export default abstract class ElementPresenter extends Presenter
{
    element: Proxy;

    constructor(state: AppState, parentPath: Presenter[], key: number, element: Proxy) {
        super(state, parentPath, key);

        this.element = element;
        this.element.attach(this.path);
    }

    abandoned() {
        this.element.detach(this.path);
    }
}

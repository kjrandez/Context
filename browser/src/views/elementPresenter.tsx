import { Presenter } from "../interfaces";
import Proxy from "../proxy";

export default abstract class ElementPresenter extends Presenter
{
    parent: Presenter
    key: number;
    element: Proxy;

    constructor(parent: Presenter, key: number, element: Proxy) {
        super();

        this.parent = parent;
        this.key = key;
        this.element = element;
    }
}

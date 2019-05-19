import Presenter from "./presenter";
import { Proxy } from "./state";
import { AppState } from "./app";

export default abstract class ElementPresenter extends Presenter
{
    subject: Proxy;

    constructor(state: AppState, parentPath: Presenter[], key: number, element: Proxy) {
        super(state, parentPath, key);

        this.subject = element;
        this.subject.attach(this.path, this.onUpdate.bind(this));
    }

    abandoned() {
        this.subject.detach(this.path);
    }

    // Update state asynchronously when a foreign object updates
    abstract async onUpdate(subject: Proxy): Promise<void>;
}

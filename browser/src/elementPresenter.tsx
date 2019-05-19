import { AsyncPresenter, AsyncPresenterArgs } from "./presenter";
import { Proxy } from "./state";

export interface ElementPresenterArgs extends AsyncPresenterArgs
{
    subject: Proxy
};

export default abstract class ElementPresenter extends AsyncPresenter
{
    subject: Proxy;

    constructor(args: ElementPresenterArgs) {
        super(args);

        this.subject = args.subject;
        this.subject.attach(this.path, this.onUpdate.bind(this));
    }

    abandoned() {
        this.subject.detach(this.path);
    }

    // Update state asynchronously when a foreign object updates
    abstract async onUpdate(subject: Proxy): Promise<void>;
}

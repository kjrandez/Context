import { AsyncPresenter, AsyncPresenterArgs } from "./presenter";
import { Proxy } from "./state";
import { AppState } from "./app";

export interface ElementPresenterArgs extends AsyncPresenterArgs { subject: Proxy<any> };

export default abstract class ElementPresenter extends AsyncPresenter
{
    subject: Proxy<any>;

    constructor(state: AppState, parentPath: AsyncPresenter[], args: ElementPresenterArgs) {
        super(state, parentPath, args);
        this.subject = args.subject;
        this.subject.attach(this.path, this.onUpdate.bind(this));
    }

    abandoned() {
        this.subject.detach(this.path);
    }

    // Update state asynchronously when a foreign object updates
    abstract async onUpdate(value: any): Promise<void>;
}

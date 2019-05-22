import { Proxy } from './state';
import { AsyncPresenterArgs, AsyncPresenter } from "./presenter";

export interface ElementPresenterArgs extends AsyncPresenterArgs {
    subject: Proxy<any>
}

export default abstract class ElementPresenter extends AsyncPresenter {}

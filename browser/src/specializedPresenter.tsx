import { Proxy } from './state';
import { AsyncPresenterArgs, AsyncPresenter } from "./presenter";

export interface ASpecializedPresenterArgs extends AsyncPresenterArgs {
    subject: Proxy<any>
}

export default abstract class ASpecializedPresenter extends AsyncPresenter {}

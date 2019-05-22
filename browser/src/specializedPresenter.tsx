import { Proxy } from './state';
import { PresenterArgs, Presenter } from "./presenter";

export interface ASpecializedPresenterArgs extends PresenterArgs {
    subject: Proxy<any>
}

export default abstract class ASpecializedPresenter extends Presenter {}

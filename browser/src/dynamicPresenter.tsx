import Presenter from './presenter';

export default interface DynamicPresenter extends Presenter
{
    contentChanged(): void;
}

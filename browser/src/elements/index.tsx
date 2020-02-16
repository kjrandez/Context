import {Model, Value} from '../types';
import {Store} from '../store';

export {default as Page} from './page';
export {default as Text} from './text';
export {default as Unknown} from './unknown';

export interface ElementProps {
    store: Store;
    model: Model<Value>
    path: number[];
}

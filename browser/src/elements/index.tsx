import {Store} from '../types';

export {default as Page} from './page';
export {default as Text} from './text';
export {default as Unknown} from './unknown';

export interface ElementProps {
    store: Store;
    eid: number;
    path: number[];
}

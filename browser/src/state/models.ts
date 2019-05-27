import { configure, observable } from 'mobx';
import { Proxy } from '../client';

export interface IElementModel {
    id: number,
    type: string,
    value: any
}

export class ElementModel implements IElementModel
{
    id: number;
    @observable type: string;
    @observable value: any;

    constructor(obj: IElementModel) {
        this.id = obj.id;
        this.type = obj.type;
        this.value = obj.value;
    }
}

export interface PageValue {
    entries: PageEntry[];
    latestEntry: Proxy<any>
}

export interface PageEntry {
    key: number;
    element: Proxy<any>;
}
 
export interface TextValue {
    content: string;
}

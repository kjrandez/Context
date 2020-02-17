import {Proxy} from './client';

export type StrDict<T> = {[_: string]: T};
export type NumDict<T> = {[_: number]: T};

export type Value = {[_: string]: any}
export interface Model<T extends Value> {id: number, type: string, value: T}

export type PageEntry = {key: number, element: Proxy};
export type PageValue = {entries: PageEntry[]}
export type TextValue = {content: string}

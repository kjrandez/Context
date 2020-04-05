import {Proxy} from './client';

export type StrDict<T> = {[_: string]: T};
export type NumDict<T> = {[_: number]: T};

export type Value = {[_: string]: any}
export interface Model<T extends Value> {eid: number, agent: string, value: T}

export type PageEntry = {index: number, entity: Proxy};
export type PageValue = {entries: PageEntry[]}
export type TextValue = {content: string}

export function mapObj<T, R>(
    obj: { [_: string]: T},
    valueMapping: (_: T) => R,
    keyMapping: (_: string) => string = (K) => K,
) {
    return Object.assign({}, ...Object.entries(obj).map(
         ([K, V]: [string, T]) => ({[keyMapping(K)]: valueMapping(V)}) 
    ));
}

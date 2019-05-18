import React, { ReactElement } from 'react';
import Proxy from './proxy';

export interface Proxyable {
    proxyableId: number | null;
}

export abstract class Presenter
{
    // Synchronous render, must return quickly
    abstract view(): ReactElement;

    // Update data asynchronously if necessary
    abstract async fetch(): Promise<any>;

    // Hook to update information asynchronously when a connected model has changed
    abstract modelChanged(object: Proxy, model: Model): Promise<void>;

    async fetchView(): Promise<ReactElement> {
        await this.fetch();
        return this.view();
    }
}

export type Dict<T> = { [_: string]: T }

export type Argument = Dict<any>

export type Model = Dict<any>

export type Mapping<T> = (_: T) => T;
// e.g. X => foo(X)

export type DictMapping<T> = (_: [string, T]) => {[_: string]: T}
// e.g.  [K, V] => { [foo(K)]: bar(V) }

export function mapObj<T>(obj: Dict<T>, mapping: DictMapping<T>): {[_: string]: T} {
    return Object.assign({}, ...Object.entries(obj).map(mapping));
}

export function mapObjValues<T>(obj: Dict<T>, mapping: Mapping<T>) {
    return mapObj(obj, ([K,V]: [string, T]) => ( {[K]: mapping(V)} ) );
}

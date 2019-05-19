export type Dict<T> = { [_: string]: T }

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

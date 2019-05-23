
export function mapObj<T, R>(
    obj: { [_: string]: T},
    valueMapping: (_: T) => R,
    keyMapping: (_: string) => string = (K) => K,
) {
    return Object.assign({}, ...Object.entries(obj).map(
         ([K, V]: [string, T]) => ({[keyMapping(K)]: valueMapping(V)}) 
    ));
}

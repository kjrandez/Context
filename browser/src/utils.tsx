export function mapObj<T, V>
(
    dict: {[_: string]: T},
    valueMapping: (_: T) => V,
    keyMapping: (_: string) => string = (K) => K,
) {
    return Object.assign({}, ...Object.entries(dict).map(
        ([key, value]) => (
            {[keyMapping(key)]: valueMapping(value)}
        )
    ));
}

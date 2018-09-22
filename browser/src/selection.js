export default class Selection
{
    constructor(path, index, fragment, ref) {
        this.path = path;
        this.index = index;
        this.fragment = fragment;
        this.ref = ref;
    }

    equals(aSelection) {
        return this.samePath(aSelection.path) &&
            (this.index === aSelection.index) &&
            (this.fragment === aSelection.fragment) &&
            (this.ref === aSelection.ref)
    }

    samePath(path2) {
        return this.path.every((item, index) => item === path2[index])
    }
}
export default class Selection
{
    constructor(path, index, fragment) {
        this.path = path;
        this.index = index;
        this.fragment = fragment;
    }

    equals(aSelection) {
        return this.samePath(aSelection.path) &&
            (this.index === aSelection.index) &&
            (this.fragment === aSelection.fragment);
    }

    samePath(path2) {
        return this.path.every((item, index) => item === path2[index])
    }
}
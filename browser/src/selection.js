export default class Selection
{
    constructor(loc, fragment, ref) {
        this.loc = loc;
        this.fragment = fragment;
        this.ref = ref;
    }

    equals(aSelection) {
        return this.samePath(aSelection.loc.path) &&
            (this.loc.key === aSelection.loc.key) &&
            (this.fragment === aSelection.fragment) &&
            (this.ref === aSelection.ref)
    }

    samePath(path2) {
        return this.loc.path.length === path2.length &&
            this.loc.path.every((item, index) => item === path2[index]);
    }

    parentId() {
        return this.loc.path[this.loc.path.length - 1];
    }
}
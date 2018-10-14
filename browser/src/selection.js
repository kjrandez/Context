export default class Selection
{
    constructor(tag, ref) {
        this.tag = tag;
        this.ref = ref;
    }

    equals(aSelection) {
        return this.samePath(aSelection.tag.path) &&
            (this.tag.key === aSelection.tag.key) &&
            (this.ref === aSelection.ref)
    }

    samePath(path2) {
        return this.tag.path.length === path2.length &&
            this.tag.path.every((item, index) => item === path2[index]);
    }

    parentId() {
        return this.tag.path[this.tag.path.length - 1];
    }
}
export default class TextAction
{
    constructor(fragment, value, type) {
        this.fragment = fragment;
        this.value = value;
        this.type = type;

        this.splice = this.splice.bind(this);
        this.change = this.change.bind(this);
    }

    splice(start, stop, insertion) {
        this.fragment.invoke("splice", [start, stop, insertion], false);

        const newContent = strSplice(this.value.content, start, stop - start, insertion);
        this.fragment.update({ content: newContent }, this.type);
    }

    change(value) {
        this.fragment.invoke("update", [value], false);
        this.fragment.update({ content: value}, this.type);
    }
}

function strSplice(str, index, amount, add) {
    return str.substring(0, index) + add + str.substring(index + amount);
}

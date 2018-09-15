export default class Fragment
{
    // This class should probably not store the element's value data directly,
    // but should connect the visual to the model where the data actually is.

    constructor(store, model) {
        this.store = store;
        this.immKey = model.key;
        this.immType = model.type;
        this.visual = null;
    }

    key() {
        return this.immKey;
    }

    type() {
        return this.immType;
    }

    value() {
        return this.store.value(this.immKey);
    }

    meta() {
        return this.store.meta(this.immKey);
    }

    event(desc) {
        this.store.event(this, desc);
    }

    changed() {
        if(this.visual != null) {
            this.visual.modelChanged();
        }
    }

    connect(visual) {
        this.visual = visual;
    }

    disconnect() {
        this.visual = null;
    }
}

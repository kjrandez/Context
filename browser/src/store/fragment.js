export default class Fragment
{
    // This class should probably not store the element's value data directly,
    // but should connect the visual to the model where the data actually is.

    constructor(store, model) {
        this.store = store;
        this.immId = model.id;
        this.immType = model.type;
        this.visuals = [];
    }

    id() {
        return this.immId;
    }

    type() {
        return this.immType;
    }

    value() {
        return this.store.value(this.immId);
    }

    invoke(desc) {
        this.store.invoke(this, desc);
    }

    update() {
        this.visuals.forEach(visual => visual.modelChanged());
    }

    connect(visual) {
        this.visuals.push(visual);
    }

    disconnect(visual) {
        this.visuals.splice(this.visuals.indexOf(visual), 1);
    }
}

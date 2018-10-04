export default class Fragment
{
    // This class should probably not store the element's value data directly,
    // but should connect the visual to the model where the data actually is.

    constructor(id, store) {
        this.store = store;
        this.immId = id;
        this.visuals = [];
    }

    id() {
        return this.immId;
    }

    invoke(selector, args) {
        this.store.invoke(this, selector, args);
    }

    invokeBackground(selector, args) {
        this.store.invokeBackground(this, selector, args);
    }

    model(value, type) {
        this.visuals.forEach(entry => entry.initialValueHandler(value, type, this));
    }

    update(value, type) {
        this.visuals.forEach(entry => entry.updatedValueHandler(value, type, this));
    }

    attach(visual, initialValueHandler, updatedValueHandler) {
        if(updatedValueHandler === undefined)
            updatedValueHandler = initialValueHandler;

        this.visuals.push({
            visual: visual,
            initialValueHandler: initialValueHandler,
            updatedValueHandler: updatedValueHandler
        });

        this.store.attach(this);
    }

    detach(visual) {
        var index = this.visuals.findIndex(entry => entry.visual === visual);
        if(index >= 0)
            this.visuals.splice(index, 1);

        if(this.visuals.length === 0)
            this.store.detach(this);
    }
}

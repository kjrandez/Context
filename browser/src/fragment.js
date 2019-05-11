export default class Fragment
{
    // This class should probably not store the element's value data directly,
    // but should connect the visual to the model where the data actually is.

    constructor(id, store) {
        this.store = store;
        this.immId = id;
        this.visuals = [];
        this.promiseIndex = 0;
        this.promises = [];
    }

    id() {
        return this.immId;
    }

    invoke(selector, args, respond) {
        this.store.invoke(this, selector, args, respond);
    }

    invokeAsync(selector, args) {
        new Promise()
        this.store.invoke(this, selector, args, true);
    }

    invokeBackground(selector, args, respond) {
        this.store.invokeBackground(this, selector, args, respond);
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

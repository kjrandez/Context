import Fragment from './Fragment.js';

export default class Store
{
    constructor() {
        this.fragmentDict = {}
        this.modelDict = {}
        this.topLevel = []
    }

    topLevelContent() {
        return this.topLevel;
    }

    setModel(model) {
        this.topLevel = model.value.content.map(elementModel => {
            this.load(elementModel);
            return this.fragmentDict[elementModel.key];
        });
    }

    load(model) {
        if(!(model.key in this.fragmentDict)) {
            this.fragmentDict[model.key] = new Fragment(this, model)
            this.modelDict[model.key] = model;

            if(model.type === "page")
                model.value.content.forEach(elementModel => this.load(elementModel));
        }
    }

    fragment(key) {
        return this.fragmentDict[key];
    }

    event(fragment, desc) {
        if(fragment.type() === "text" && desc.transaction === "update") {
            var model = this.modelDict[fragment.key()];
            model.value.content = desc.value;
            fragment.changed();
        }
    }

    value(key) {
        return this.modelDict[key].value;
    }
}
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
        this.topLevel = model.value.map(elementModel => {
            this.load(elementModel);
            return this.fragmentDict[elementModel.key];
        });
    }

    load(model) {
        if(!(model.key in this.fragmentDict)) {
            this.fragmentDict[model.key] = new Fragment(this, model)
            this.modelDict[model.key] = model;

            if(model.type === "page")
                model.value.forEach(elementModel => this.load(elementModel));
        }
    }

    event(fragment, desc) {
        if(fragment.type === "text" && desc.transaction === "update") {
            var model = this.modelDict[fragment.key];
            model.value = desc.value;
            fragment.changed();
        }
    }

    value(key) {
        var model = this.modelDict[key];
        switch(model.type) {
            case "page":
                return model.value.map(elementModel => this.fragmentDict[elementModel.key]);
            default:
                return model.value;
        }
    }

    meta(key) {
        return this.modelDict[key].meta;
    }
}
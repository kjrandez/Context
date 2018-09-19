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

    setModel(rootKey, elements) {
        this.load(elements)
        var root = this.modelDict[rootKey];
        this.topLevel = root.value.content.map(key => this.fragmentDict[key])
        console.log(this.topLevel)
    }

    load(modelList) {
        for(var key in modelList) {
            if(!(key in this.fragmentDict)) {
                this.fragmentDict[key] = new Fragment(this, modelList[key])
            }
            this.modelDict[key] = modelList[key]
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
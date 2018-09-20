import Fragment from './Fragment.js';

export default class Store
{
    constructor() {
        this.fragmentDict = {}
        this.modelDict = {}
        this.topLevel = null
    }

    topLevelFragment() {
        return this.topLevel;
    }

    setModel(topPageKey, elements) {
        this.loadModelDict(elements)
        this.topLevel = this.fragmentDict[topPageKey]
    }

    update(trans, elementModels) {
        this.loadModelList(elementModels);
        var updatedFragment = this.fragmentDict[trans.key]
        updatedFragment.update()
    }

    loadModelList(newModelList) {
        newModelList.forEach(model => {
            if(!(model.key in this.fragmentDict)) {
                this.fragmentDict[model.key] = new Fragment(this, model)
            }
            this.modelDict[model.key] = model;
        });
    }

    loadModelDict(newModelDict) {
        for(var key in newModelDict) {
            if(!(key in this.fragmentDict)) {
                this.fragmentDict[key] = new Fragment(this, newModelDict[key])
            }
            this.modelDict[key] = newModelDict[key]
        }
    }

    fragment(key) {
        return this.fragmentDict[key];
    }

    event(fragment, desc) {
        if(fragment.type() === "text" && desc.transaction === "update") {
            var model = this.modelDict[fragment.key()];
            model.value.content = desc.value;
            fragment.update();
        }
    }

    value(key) {
        return this.modelDict[key].value;
    }
}
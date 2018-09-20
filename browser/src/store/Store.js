import Fragment from './Fragment.js';

export default class Store
{
    constructor(app) {
        this.app = app;
        this.fragmentDict = {};
        this.modelDict = {};
        this.topLevel = null;

        this.localHandlers = {
            "text-update": this.invlocTextUpdate.bind(this)
        };
    }

    topLevelFragment() {
        return this.topLevel;
    }

    setModel(topPageKey, elements) {
        this.loadModelDict(elements);
        this.topLevel = this.fragmentDict[topPageKey];
    }

    update(trans, elementModels) {
        this.loadModelList(elementModels);
        var updatedFragment = this.fragmentDict[trans.key];
        updatedFragment.update();
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

    invoke(fragment, desc) {
        var requestUpdate = true;
        var invlocKey = fragment.type() + "-" + desc.selector;
        if(invlocKey in this.localHandlers) {
            this.localHandlers[invlocKey](fragment, desc)
            requestUpdate = false;
        }
        this.app.kernelSend("invoke", {
            element: fragment.key(),
            selector: desc.selector,
            arguments: desc.arguments.map(arg => encoded(arg)),
            respond: requestUpdate
        });
    }

    invlocTextUpdate(fragment, desc) {
        var model = this.modelDict[fragment.key()];
        model.value.content = desc.value;
        fragment.update();
    }

    value(key) {
        return this.modelDict[key].value;
    }
}

function encoded(argument) {
    if(argument instanceof Fragment)
        return { type: "obj", value: argument.key }
    else
        return { type: "std", value: argument };
}

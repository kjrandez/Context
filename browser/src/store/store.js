import Fragment from './fragment.js';

export default class Store
{
    constructor(app) {
        this.app = app;
        this.fragmentDict = {};
        this.modelDict = {};
        this.topLevel = null;

        this.localHandlers = {
            "Text-update": this.invlocContentUpdate.bind(this),
            "Script-update": this.invlocContentUpdate.bind(this)
        };
    }

    topLevelFragment() {
        return this.topLevel;
    }

    setModel(topPageId, elements) {
        this.loadModelDict(elements);
        this.topLevel = this.fragmentDict[topPageId];
    }

    update(trans, elementModels) {
        this.loadModelList(elementModels);
        var updatedFragment = this.fragmentDict[trans.id];
        updatedFragment.update();
    }

    loadModelList(newModelList) {
        newModelList.forEach(model => {
            if(!(model.id in this.fragmentDict)) {
                this.fragmentDict[model.id] = new Fragment(this, model)
            }
            this.modelDict[model.id] = model;
        });
    }

    loadModelDict(newModelDict) {
        for(var id in newModelDict) {
            if(!(id in this.fragmentDict)) {
                this.fragmentDict[id] = new Fragment(this, newModelDict[id])
            }
            this.modelDict[id] = newModelDict[id]
        }
    }

    fragment(id) {
        return this.fragmentDict[id];
    }

    invoke(fragment, desc) {
        var requestUpdate = true;
        var invlocId = fragment.type() + "-" + desc.selector;
        if(invlocId in this.localHandlers) {
            this.localHandlers[invlocId](fragment, desc)
            requestUpdate = false;
        }
        this.app.kernelSend("invoke", {
            element: fragment.id(),
            selector: desc.selector,
            arguments: desc.arguments.map(arg => encoded(arg)),
            respond: requestUpdate
        });
    }

    invlocContentUpdate(fragment, desc) {
        var model = this.modelDict[fragment.id()];
        model.value.content = desc.value;
        fragment.update();
    }

    value(id) {
        return this.modelDict[id].value;
    }
}

function encoded(argument) {
    if(argument instanceof Fragment)
        return { type: "obj", value: argument.id() }
    else
        return { type: "std", value: argument };
}

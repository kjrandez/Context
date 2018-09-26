import Fragment from './fragment.js';
import NewElement from './newElement.js';

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
        this.modelDict = {}
        this.fragmentDict = {}
        this.loadModelDict(elements);
        this.topLevel = this.fragmentDict[topPageId];
    }

    update(trans, elementModels) {
        this.loadModelDict(elementModels);
        var updatedFragment = this.fragmentDict[trans.id];
        updatedFragment.update();
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

    invoke(fragment, selector, args) {
        var requestUpdate = true;
        var invlocId = fragment.type() + "-" + selector;
        if(invlocId in this.localHandlers) {
            this.localHandlers[invlocId](fragment, args)
            requestUpdate = false;
        }
        this.app.kernelSend("invoke", {
            element: fragment.id(),
            selector: selector,
            arguments: args.map(arg => encoded(arg)),
            respond: requestUpdate
        });
    }

    invlocContentUpdate(fragment, args) {
        var model = this.modelDict[fragment.id()];
        model.value.content = args[0];
        fragment.update();
    }

    value(id) {
        return this.modelDict[id].value;
    }
}

function encoded(param) {
    if(param instanceof Fragment)
        return { type: "obj", value: param.id() }
    else if(param instanceof NewElement)
        return { type: "new", value: {
            elementType: param.elementType,
            args: param.args.map(arg => encoded(arg))
        }}
    else
        return { type: "std", value: param };
}

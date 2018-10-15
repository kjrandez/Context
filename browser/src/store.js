import Fragment from './fragment.js';
import NewElement from './newElement.js';
import DuplicateElement from './duplicateElement.js';

export default class Store
{
    constructor(app) {
        this.app = app;
        this.fragmentDict = {};
        this.rootPage = null;
        this.clipboard = null;

        /*this.localHandlers = {
            "Text-update": this.invlocContentUpdate.bind(this),
            "Text-splice": this.invlocContentSplice.bind(this),
            "Script-update": this.invlocContentUpdate.bind(this),
            "Script-splice": this.invlocContentSplice.bind(this),
        };*/
    }

    clear() {
        this.fragmentDict = {}
    }

    model(elementModel) {
        var fragment = this.fragmentDict[elementModel.id];
        fragment.model(elementModel.value, elementModel.type);
    }

    update(transModel, elementModel) {
        var updatedFragment = this.fragmentDict[elementModel.id];
        updatedFragment.update(elementModel.value, elementModel.type);
    }

    fragment(id) {
        var fragment = null;

        if(!(id in this.fragmentDict)) {
            fragment = new Fragment(id, this);
            this.fragmentDict[id] = fragment;
        }
        else {
            fragment = this.fragmentDict[id];
        }

        return fragment;
    }

    attach(fragment) {
        this.app.kernelSend("attachElement", fragment.id());
    }

    detach(fragment) {
        this.app.kernelSend("detachElement", fragment.id());
    }

    invoke(fragment, selector, args, respond) {
        this.invokeCommon(fragment, selector, args, respond, "invoke");
    }

    invokeBackground(fragment, selector, args, respond) {
        this.invokeCommon(fragment, selector, args, respond, "invokeInBackground");
    }

    invokeCommon(fragment, selector, args, respond, command) {
        this.app.kernelSend(command, {
            element: fragment.id(),
            selector: selector,
            arguments: args.map(arg => encoded(arg)),
            respond: respond
        });
    }
}

function encoded(param) {
    if(Array.isArray(param))
        return param.map(entry => encoded(entry))
    else if(param instanceof Fragment)
        return { type: "obj", value: param.id() }
    else if(param instanceof NewElement)
        return { type: "new", value: {
            elementType: param.elementType,
            args: param.args.map(arg => encoded(arg))
        }}
    else if(param instanceof DuplicateElement)
        return { type: "dup", value: param.fragment.id() }
    else
        return { type: "std", value: param };
}

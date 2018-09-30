import Fragment from './fragment.js';
import NewElement from './newElement.js';
import DuplicateElement from './duplicateElement.js';

class StoreError
{
    constructor(message) {
        this.message = message;
    }
}

export default class Store
{
    constructor(app) {
        this.app = app;
        this.fragmentDict = {};
        this.modelDict = {};
        this.topLevel = null;
        this.clipboard = null;

        this.localHandlers = {
            "Text-update": this.invlocContentUpdate.bind(this),
            "Script-update": this.invlocContentUpdate.bind(this)
        };
    }

    topLevelFragment() {
        return this.topLevel;
    }

    clipboardFragment() {
        return this.clipboard;
    }

    setModel(topPageId, clipboardId, elements) {
        this.modelDict = {}
        this.fragmentDict = {}
        this.loadModelDict(elements);
        this.topLevel = this.fragmentDict[topPageId];
        this.clipboard = this.fragmentDict[clipboardId];
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
        if(!(id in this.fragmentDict))
            throw new StoreError("Attempt to access non-present element: " + id);
        return this.fragmentDict[id];
    }

    invoke(fragment, selector, args) {
        this.invokeCommon(fragment, selector, args, "invoke");
    }

    invokeBackground(fragment, selector, args) {
        this.invokeCommon(fragment, selector, args, "invokeInBackground");
    }

    invokeCommon(fragment, selector, args, command) {
        var requestUpdate = true;
        var invlocId = fragment.type() + "-" + selector;
        if(invlocId in this.localHandlers) {
            this.localHandlers[invlocId](fragment, args)
            requestUpdate = false;
        }
        this.app.kernelSend(command, {
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
        if(!(id in this.modelDict))
            throw new StoreError("Attempt to read non-present element: " + id);
        return this.modelDict[id].value;
    }

    actionPin(selection) {
        this.clipboard.invoke("insertAt", [selection.fragment, 0]);
    }
    
    actionDuplicate(selection) {
        this.clipboard.invoke("insertAt", [new DuplicateElement(selection.fragment), 0]);
    }
    
    actionCut(selection) {
        this.clipboard.invoke("insertAt", [selection.fragment, 0]);
        this.actionDelete(selection);
    }
    
    actionDelete(selection) {
        var path = selection.loc.path;
        var parentId = path[path.length - 1];
        var parent = this.fragment(parentId);
    
        // Remove the entry with this key from the parent
        parent.invoke("remove", [selection.loc.key]);
    }

    actionIndent(selections) {
        // Create new Page to pass as argument
        var fragments = selections.map(sel => sel.fragment);
        var newPage = new NewElement("Page", [fragments]);

        // Invoke insertBefore on parent with the new page
        var parent = this.fragment(selections[0].parentId());
        var beforeKey = selections[0].loc.key;
        this.app.setGrabPath(selections[0].loc.path);
        parent.invoke("insertBefore", [newPage, beforeKey, true]);

        // Remove each of the elements by key from the parent
        selections.forEach(sel => this.actionDelete(sel));
    }

    actionDedent(selections) {
        // Insert each of the elements after the parent's parent
        var path = selections[0].loc.path;
        var grandParentId = path[path.length - 2];
        var grandParent = this.fragment(grandParentId);
        var parent = this.fragment(selections[0].parentId());

        // Add each element to the grandparent before the parent page and
        // remove each element from the parent page.
        selections.forEach(sel => {
            grandParent.invoke("insertBefore", [sel.fragment, parent]);
            parent.invoke("remove", [sel.loc.key]);
        });

        // Also remove the parent page if it went down to 0 elements
        if(parent.value().content.length === selections.length) {
            grandParent.invoke("remove", [parent]);
        }
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

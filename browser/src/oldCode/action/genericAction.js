import DuplicateElement from '../duplicateElement';
import NewElement from '../newElement';

export default class GenericAction
{
    constructor(clipboard, app) {
        this.clipboard = clipboard;
        this.app = app;

        this.pin = this.pin.bind(this);
        this.duplicate = this.duplicate.bind(this);
        this.cut = this.cut.bind(this);
        this.delete = this.delete.bind(this);
        this.indent = this.indent.bind(this);
        this.dedent = this.dedent.bind(this);
    }
    
    pin(selection) {
        this.clipboard.invoke("insertAt", [selection.fragment, 0], true);
    }
    
    duplicate(selection) {
        this.clipboard.invoke("insertAt", [new DuplicateElement(selection.fragment), 0], true);
    }
    
    cut(selection) {
        this.clipboard.invoke("insertAt", [selection.fragment, 0], true);
        this.delete(selection);
    }
    
    delete(selection) {
        var path = selection.loc.path;
        var parentId = path[path.length - 1];
        var parent = this.app.store.fragment(parentId);
    
        // Remove the entry with this key from the parent
        parent.invoke("remove", [selection.loc.key], true);
    }

    indent(selections) {
        // Create new Page to pass as argument
        var fragments = selections.map(sel => sel.fragment);
        var newPage = new NewElement("Page", [fragments]);

        // Invoke insertBefore on parent with the new page
        var parent = this.app.store.fragment(selections[0].parentId());
        var beforeKey = selections[0].loc.key;
        this.app.setGrabPath(selections[0].loc.path);
        parent.invoke("insertBefore", [newPage, beforeKey, true], true);

        // Remove each of the elements by key from the parent
        selections.forEach(sel => this.delete(sel));
    }

    dedent(selections) {
        // Insert each of the elements after the parent's parent
        var path = selections[0].loc.path;
        var grandParentId = path[path.length - 2];
        var grandParent = this.app.store.fragment(grandParentId);
        var parent = this.app.store.fragment(selections[0].parentId());

        // Add each element to the grandparent before the parent page and
        // remove each element from the parent page.
        selections.forEach(sel => {
            grandParent.invoke("insertBefore", [sel.fragment, parent], true);
            parent.invoke("remove", [sel.loc.key], true);
        });

        // Also remove the parent page if it went down to 0 elements
        if(parent.value().content.length === selections.length) {
            grandParent.invoke("remove", [parent], true);
        }
    }
}
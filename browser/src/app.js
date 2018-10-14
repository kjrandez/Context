import Store from './store';

export default class App
{
    constructor()
    {
        this.kernel = new WebSocket("ws://localhost:8085/broadcast");
        this.kernel.onopen = (event) => this.kernelOpen(event);
        this.kernel.onclose = (event) => this.kernelClose(event);

        this.top = null;
        this.selection = new Map();
        this.grabPath = null;
        this.keyListeners = []
        this.shiftDown = false;
        this.ctrlDown = false;
    }

    connectKeyListener(listener) {
        this.keyListeners.push(listener);
    }

    disconnectKeyListener(listener) {
        var index = this.keyListeners.indexOf(listener);
        this.keyListeners.splice(index, 1);
    }

    startup(component) {
        this.top = component;
        this.kernel.onmessage = event => this.kernelMessage(event);
        document.onkeydown = event => this.documentKeyDown(event);
        document.onkeyup = event => this.documentKeyUp(event);
    } 

    notifyShiftKey(down) {
        this.keyListeners.forEach(listener => listener.shiftKey(down));
    }

    notifyCtrlKey(down) {
        this.keyListeners.forEach(listener => listener.ctrlKey(down));
    }

    actionUndo() {
        this.kernelSend("undo", null);
    }

    actionRedo() {
        this.kernelSend("redo", null);
    }
    
    documentKeyDown(event) {
        if(event.keyCode === 89 && this.ctrlDown) {
            this.actionRedo();
            event.preventDefault();
        } 
        else if(event.keyCode === 90 && this.ctrlDown) {
            this.actionUndo();
            event.preventDefault();
        }
        else if(event.keyCode === 16 && !this.shiftDown) {
            this.shiftDown = true;
            this.notifyShiftKey(true);
        }
        else if(event.keyCode === 17 && !this.ctrlDown) {
            this.ctrlDown = true;
            this.notifyCtrlKey(true);
        }
        if(event.keyCode === 27) {
            this.deselectedAll();
        }
    }

    documentKeyUp(event) {
        if(event.keyCode === 16 && this.shiftDown) {
            this.shiftDown = false;
            this.notifyShiftKey(false);
        }
        else if(event.keyCode === 17 && this.ctrlDown) {
            this.ctrlDown = false;
            this.notifyCtrlKey(false);
        }
    }

    enterRoot() {
        window.location.hash = "";
        this.top.setPage(this.rootPage, this.clipboard, []);
    }

    enterPage(path, pageId) {
        var newHash = "#" + path.join(",");
        if(path.length > 0)
            newHash += ",";
        newHash += pageId;

        window.location.hash = newHash;
        this.top.setPage(this.store.fragment(pageId), this.clipboard, path);
    }

    setGrabPath(path) {
        // Loose end if a call fails.
        this.grabPath = path;
    }

    getGrabPath() {
        return this.grabPath;
    }

    grabSelection(newSelection) {
        this.selected(newSelection, false);
        this.grabPath = null;
    }

    clearSelections() {
        this.selection.forEach(selContent => selContent.fragment.detach(this));
        this.selection.clear();
    }

    removeSelection(selection) {
        this.selection.get(selection).fragment.detach(this);
        this.selection.delete(selection);
    }

    addSelection(selection) {
        var fragment = this.store.fragment(selection.tag.id);

        this.selection.set(selection, {
            tag: selection.tag,
            ref: selection.ref,
            fragment: fragment,
            value: null,
            type: null
        });

        fragment.attach(
            this,
            (value, type) => this.selectionFilled(selection, value, type)
        );
    }

    selectionList() {
        return [...this.selection.keys()];
    }

    selectionContent() {
        return [...this.selection.values()];
    }

    selectionFilled(selection, value, type) {
        var selContent = this.selection.get(selection);
        selContent.value = value;
        selContent.type = type;

        if(this.selectionComplete())
            this.top.setSelectionContent(this.selectionContent());
    }

    selectionComplete() {
        var complete = true;
        for(let selContent of this.selection.values()) {
            if(selContent.value == null) {
                complete = false;
                break;
            }
        }

        return complete;
    }

    selected(newSelection, ctrlDown) {
        if(ctrlDown) {
            if(this.selection.has(newSelection)) {
                this.removeSelection(newSelection);
                this.top.setSelectionContent(this.selectionContent());
            }
            else {
                this.addSelection(newSelection);
                // selectionContent gets updated later
            }
        }
        else {
            if(this.selection.size === 1 && this.selection.has(newSelection))
                return;
            this.clearSelections();
            this.addSelection(newSelection);
            // selectionContent gets updated later
        }

        this.top.setSelection(this.selectionList());
    }

    deselected(selection) {
        if(this.selection.has(selection))
            this.removeSelection(selection);

        this.top.setSelection(this.selectionList());
        this.top.setSelectionContent(this.selectionContent());
    }

    deselectedAll() {
        if(this.selection.size === 0)
            return;
        this.clearSelections();

        this.top.setSelection([]);
        this.top.setSelectionContent([]);
    }

    kernelSend(selector, data) {
        this.kernel.send(JSON.stringify({
            selector: selector,
            data: data
        }));
    }

    kernelOpen(event) {
        var pathString = window.location.hash.substr(1);
        var splitPath = pathString.split(",");

        if(pathString.length === 0 || splitPath.length === 0) {
            this.openingPage = null;
            this.openingPath = [];
        }
        else {
            var path = splitPath.map(segment => parseInt(segment, 10));
            var pageId = path.pop();
            this.openingPage = pageId;
            this.openingPath = path;
        }

        this.kernelSend("requestRoot", null);
    }
    
    kernelClose(event) {
        alert('Connection closed.');
    }
    
    kernelMessage(event) {
        var message = JSON.parse(event.data);
        console.log("Received message: ");
        console.log(message);

        switch(message.selector) {
            case 'root':
                var rootPageId = message.arguments[0];
                var clipboardId = message.arguments[1];

                this.store = new Store(this);
                this.rootPage = this.store.fragment(rootPageId);
                this.clipboard = this.store.fragment(clipboardId);

                var page = null;
                if(this.openingPage != null)
                    page = this.store.fragment(this.openingPage);
                else   
                    page = this.rootPage;
                
                this.top.setPage(page, this.clipboard, this.openingPath);
                break;
            case 'model':
                this.store.model(...message.arguments);
                break;
            case 'update':
                this.store.update(...message.arguments);
                break;
            default:
                console.log("Unhandled message");
                break;
        }
    }
}

import Store from './store';

export default class App
{
    constructor()
    {
        this.kernel = new WebSocket("ws://localhost:8085/broadcast");
        this.kernel.onopen = (event) => this.kernelOpen(event);
        this.kernel.onclose = (event) => this.kernelClose(event);

        this.top = null;
        this.selection = [];
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
            this.selected(null, false);
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

    selected(newSelection, ctrlDown) {
        if(ctrlDown) {
            var index = this.selection.indexOf(newSelection);
            if(index >= 0) {
                // Ctrl is down and we clicked on an already-selected
                // element, so de-select it.
                this.selection.splice(index, 1);
            }
            else {
                // Ctrl is down and we clicked on a non-selected element,
                // so add it to the list of selections.
                this.selection.push(newSelection);
            }
        }
        else {
            if(newSelection != null) {
                if(this.selection.length === 1 && this.selection[0] === newSelection)
                    return;
                
                this.selection = [newSelection];
            }
            else {
                if(this.selection.length === 0)
                    return;
                
                this.selection = [];
            }
        }

        this.top.setSelection(this.selection);
    }

    deselected(selection) {
        var index = this.selection.indexOf(selection);
        if(index >= 0) {
            this.selection.splice(index, 1);
        }
        this.top.setSelection(this.selection);
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

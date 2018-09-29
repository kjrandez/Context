import Store from './store';

export default class App
{
    constructor()
    {
        this.store = new Store(this);
        this.kernel = new WebSocket("ws://localhost:8085/broadcast");
        this.kernel.onopen = (event) => this.kernelOpen(event);
        this.kernel.onclose = (event) => this.kernelClose(event);
        this.nextPath = [];
        this.selection = [];
        this.grabPath = null;
        this.top = null;
        this.shiftDown = false;
        this.ctrlDown = false;
        this.keyListeners = []
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
    
    documentKeyDown(event) {
        event = event;

        if(event.keyCode == 16 && !this.shiftDown) {
            this.shiftDown = true;
            this.notifyShiftKey(true);
        }
        else if(event.keyCode == 17 && !this.ctrlDown) {
            this.ctrlDown = true;
            this.notifyCtrlKey(true);
        }
        if(event.keyCode === 27) {
            this.selected(null, false);
        }
    }

    documentKeyUp(event) {
        event = event;

        if(event.keyCode == 16 && this.shiftDown) {
            this.shiftDown = false;
            this.notifyShiftKey(false);
        }
        else if(event.keyCode == 17 && this.ctrlDown) {
            this.ctrlDown = false;
            this.notifyCtrlKey(false);
        }
    }

    enterRoot() {
        this.nextPath = [];
        this.kernelSend("requestRoot", null);
    }

    enterPage(path, pageId) {
        this.nextPath = path;
        this.kernelSend("requestPage", { page: pageId, path: path });
    }

    setGrabPath(path) {
        // Loose end if a call fails.
        this.grabPath = path;
    }

    getGrabPath(path) {
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
        this.kernelSend("requestRoot", null);
    }
    
    kernelClose(event) {
        alert('Connection closed.');
    }
    
    kernelMessage(event) {
        var message = JSON.parse(event.data);
        console.log("Received message: ");
        console.log(message);
        
        var args = message.arguments
        switch(message.selector) {
            case 'renderPage':
                this.store.setModel(args[0], args[1], args[2]);
                this.top.setTopLevel(
                    this.store.topLevelFragment(),
                    this.store.clipboardFragment(),
                    this.nextPath
                );
                break;
            case 'update':
                this.store.update(message.arguments[0], message.arguments[1]);
                break;
            default:
                console.log("Unhandled message");
                break;
        }
    }
}

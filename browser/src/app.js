import {Store} from './store';

export default class App
{
    constructor()
    {
        this.store = new Store(this);
        this.kernel = new WebSocket("ws://localhost:8085/broadcast");
        this.kernel.onopen = (event) => this.kernelOpen(event);
        this.kernel.onclose = (event) => this.kernelClose(event);
        this.selection = [];
        this.grabPath = null;
        this.top = null;
    }

    startup(component) {
        this.top = component;
        this.kernel.onmessage = (event) => this.kernelMessage(event);

        document.onkeyup = (event) => this.documentKeyUp(event);
    }  
    
    documentKeyUp(event) {
        event = event || window.event;
        if(event.keyCode === 27)
            this.selected(null, false);
    }

    setGrabPath(path) {
        this.grabPath = path;
    }

    getGrabPath(path) {
        return this.grabPath;
    }

    selected(newSelection, ctrlDown) {
        this.grabPath = null;

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
            if(newSelection != null)
                this.selection = [newSelection];
            else
                this.selection = [];
        }

        this.top.setSelection(this.selection);
    }

    deselected(selection) {
        this.grabPath = null;

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
         
        switch(message.selector) {
            case 'renderPage':
                this.store.setModel(message.arguments[0], message.arguments[1]);
                this.top.setTopLevel(this.store.topLevelFragment());
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

import {Store} from './store';

export default class App
{
    constructor()
    {
        this.store = new Store();
        this.kernel = new WebSocket("ws://localhost:8085/broadcast");
        this.kernel.onopen = (event) => this.kernelOpen(event);
        this.kernel.onclose = (event) => this.kernelClose(event);
        this.selection = [];
        this.root = null;
    }

    startup(component) {
        this.root = component;
        this.kernel.onmessage = (event) => this.kernelMessage(event);

        document.onkeyup = (event) => this.documentKeyUp(event);
    }  
    
    documentKeyUp(event) {
        event = event || window.event;
        if(event.keyCode === 27)
            this.selected(null, false);
    }

    selected(fragment, ctrlDown) {
        if(ctrlDown) {
            var index = this.selection.indexOf(fragment);
            if(index >= 0) {
                // Ctrl is down and we clicked on an already-selected
                // element, so de-select it.
                this.selection.splice(index, 1);
            }
            else {
                // Ctrl is down and we clicked on a non-selected element,
                // so add it to the list of selections.
                this.selection.push(fragment);
            }
        }
        else {
            if(fragment != null)
                this.selection = [fragment];
            else
                this.selection = null;
        }

        this.root.setSelection(this.selection);
    }

    deselected() {
        this.selection = [];
        this.root.setSelection(this.selection);
    }

    kernelOpen(event) {
        this.kernel.send(JSON.stringify({
            selector: "requestTopPage",
            arguments: []
        }))
    }
    
    kernelClose(event) {
        alert('Connection closed.');
    }
    
    kernelMessage(event) {
        var message = JSON.parse(event.data);
        console.log("Received message: ");
        console.log(message);
        
        switch(message.selector) {
            case 'renderPage:':
                this.store.setModel(message.arguments[0]);
                console.log(this.store.topLevelContent());
                this.root.setModel(this.store.topLevelContent());
                break;
            default:
                console.log("Unhandled message");
                break;
        }
    }
}

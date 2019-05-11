import React from 'react';
import ReactDOM from 'react-dom';
import Fragment from './fragment';
import Store from './store';
import TopPresenter from './views/topPresenter';

interface Proxyable {
    proxyableId: number | null;
}

export default class App implements Proxyable
{
    proxyableId: number | null = null;

    store: Store = new Store(this);
    top: TopPresenter = new TopPresenter(this, null);
    kernel: WebSocket;
    objectTable: Proxyable[] = [this];
    objectIndex: number = 1;
    refs: any[] = [];
    refIndex: number = 0;
    freeRefIndexes: number[] = [];

    constructor() {
        this.rootChanged();

        this.kernel = new WebSocket("ws://localhost:8085/broadcast");
        this.kernel.onopen = (event) => this.kernelOpen(event);
        this.kernel.onclose = (event) => this.kernelClose(event);
        this.kernel.onmessage = event => this.kernelMessage(event);
    }

    rootChanged() {
        ReactDOM.render(this.top.render(), document.getElementById('root'));
    }

    setPage(page: Fragment, clipboard: Fragment) {
        this.top = new TopPresenter(this, page);
        this.rootChanged();
    }

    kernelOpen(event: Event) {
        this.hostCall(0, "rootPage", []).then((result: any) => {
            console.log("Fulfilled");
            console.log(result);
        }, (rejection: any) => {
            console.log("Rejected");
            console.log(rejection);
        });
    }
    
    kernelClose(event: Event) {
        alert('Connection closed.');
    }
    
    kernelSend(data: object) {
        this.kernel.send(JSON.stringify(data));
    }

    kernelMessage(event: MessageEvent) {
        var msg = JSON.parse(event.data);
        console.log("Received message: ");
        console.log(msg);

        switch(msg.type) {
            case 'call':
                this.dispatchCall(msg.id, msg.target, msg.selector, msg.arguments);
                break;
            case 'return':
                this.dispatchReturn(msg.id, msg.result)
                break;
            default:
                console.log("Unhandled message");
                break;
        }
    }

    dispatchCall(foreignId: number, targetId: number, selector: string, argDescs: []) {
        let target: any = this.objectTable[targetId];
        let args: any[] = argDescs.map((X: any) => this.decodedArgument(X));

        let result: any = target[selector].apply(target, args)

        this.kernelSend({
            type: 'return',
            id: foreignId,
            result: this.encodedArgument(result)
        });
    }

    dispatchReturn(localId: number, resultDesc: any) {
        let result: any = this.decodedArgument(resultDesc);
        let resolve: any = this.lookupLocalId(localId);
        this.freeLocalId(resolve);

        resolve(result);
    }

    hostCall(targetId: number, selector: string, args: any[]) {
        let argDescs: any[] = args.map((X: any) => this.encodedArgument(X));
        
        return new Promise((resolve, reject) => this.kernelSend({
            type: 'call',
            id: this.newLocalId(resolve),
            target: targetId,
            selector: selector,
            arguments: argDescs
        }));
    }

    newLocalId(object: any) {
        let index: number | undefined = this.freeRefIndexes.pop();
        if (index != undefined) {
            this.refs[index] = object;
            return index;
        }
        else {
            this.refs.push(object);
            index = this.refIndex;
            this.refIndex ++;
            return index;
        }
    }

    lookupLocalId(index: number) {
        return this.refs[index];
    }

    freeLocalId(index: number) {
        this.refs[index] = null;
        this.freeRefIndexes.push(index)
    }

    decodedArgument(argDesc: any) {
        if (argDesc.type == 'hostObject')
            return this.store.fragment(argDesc.id) // Fragment ~= Proxy
        else if (argDesc.type == 'clientObject')
            return this.objectTable[argDesc.id];
        else
            return argDesc.value;
    }

    encodedArgument(arg: any): any {
        if (arg instanceof Fragment) {
            return { type: 'hostObject', id: arg.immId };
        }
        else if ('proxyableId' in arg) {
            if (arg.proxyableId == null) {
                let nextId = this.objectIndex ++;
                arg.proxyableId = nextId;
            }
            return { type: 'clientObject', id: arg.proxyableId };
        }
        else {
            return { type: 'primitive', value: arg };
        }
    }
}


        //this.top = null;
        //this.selection = new Map();
        //this.currentPath = null;
        //this.pathPages = new Map();
        //this.grabPath = null;
        //this.keyListeners = []
        //this.shiftDown = false;
        //this.ctrlDown = false;

/*

                var rootPageId = message.arguments[0];
                var clipboardId = message.arguments[1];

                var rootPage = this.store.fragment(rootPageId);
                var clipboard = this.store.fragment(clipboardId);

                this.setPage(rootPage, clipboard);
                break;
            case 'model':
                this.store.model(...message.arguments);
                break;
            case 'update':
                this.store.update(...message.arguments);
                break;


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
*/

/*
    pathContent() {
        return this.currentPath.map(pageId => {
            var content = this.pathPages.get(pageId);
            return {
                pageId: pageId,
                fragment: content.fragment,
                value: content.value
            }
        });
    }

    pathPageFilled(pageId, value) {
        var content = this.pathPages.get(pageId)
        
        // We receive these updates even for keystrokes, short-circuit, or else everything
        // slows way down.
        if(content.value != null)
            return;

        content.value = value;

        if(this.pathPagesComplete()) {
            this.top.setPathContent(this.pathContent());
        }
    }

    pathPagesComplete() {
        var complete = true;
        for(let content of this.pathPages.values()) {
            if(content.value == null) {
                complete = false;
                break;
            }
        }

        return complete;
    }

    enterRoot() {
        window.location.hash = "";
        this.setPage(this.rootPage, []);
    }

    enterPage(path, pageId) {
        var newHash = "#" + path.join(",");
        if(path.length > 0)
            newHash += ",";
        newHash += pageId;

        window.location.hash = newHash;
        this.setPage(this.store.fragment(pageId), path);
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

        // We receive these updates even for keystrokes, short-circuit, or else everything
        // slows way down.
        if(selContent.value != null)
            return;

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

*/

        /* FROM KERNELOPEN
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
        }*/

        /* FROM SETPAGE
        
        this.currentPath = path;

        // Detach page fragments of previous path which aren't in new path
        var prevPathIds = [...this.pathPages.keys()];
        prevPathIds.forEach(pathId => {
            if(path.indexOf(pathId) < 0) {
                this.pathPages.get(pathId).fragment.detach(this);
                this.pathPages.delete(pathId);
            }
        });

        // Attach page fragments of current path, if not already in dictionary
        var pathUnchanged = true;
        path.forEach(pageId => {
            if(!this.pathPages.has(pageId)) {
                var fragment = this.store.fragment(pageId);
                this.pathPages.set(pageId, {
                    fragment: fragment,
                    value: null
                });

                fragment.attach(this, value => this.pathPageFilled(pageId, value));
                pathUnchanged = false;
            }
        });

        this.top.setPage(page, this.clipboard, path);
        if(pathUnchanged) {
            this.top.setPathContent(this.pathContent());
        }*/
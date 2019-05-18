import React from 'react';
import ReactDOM from 'react-dom';
import Proxy from './proxy';
import TopPresenter from './topPresenter';
import Client from './client';

type TransactionModel = {
    id: number,
    subject: Proxy
}

export default class App
{
    top: TopPresenter | null = null;

    constructor() {
        this.clearPage();
        new Client(
            this.connected.bind(this),
            this.disconnected.bind(this),
            this.broadcast.bind(this)
        );
    }

    connected(host: Proxy) {
        (async () => {
            let page = await host.call<Proxy>('rootPage', []);
            let clipboard = await host.call<Proxy>('clipboardPage', []);
            await this.setPage(page, clipboard);
        })();
    }

    disconnected() {
        this.clearPage();
    }

    broadcast(transaction: TransactionModel) {
        let paths = transaction.subject.sensitivePaths();
        let changeRoot = commonRoot(paths); 

        if (changeRoot != null) {
            (async () => {
                await changeRoot.onChange(transaction.subject);
                changeRoot.refresh();
            })();
        }
    }

    async setPage(page: Proxy, clipboard: Proxy) {
        this.top = new TopPresenter(this, page);
        await this.top.onLoad();
        ReactDOM.render(this.top.render(), document.getElementById('root'));
    }
    
    clearPage() {
        ReactDOM.render(<div></div>, document.getElementById('root'));
    }
}

function commonRoot<T>(paths: T[][]) {
    let root: T | null = null;
    
    if (paths.length === 1) {
        root = paths[0].slice(-1)[0];
    }
    else if (paths.length > 1) {
        let finished = false;
        let i = 0;

        while (!finished) {
            let current: T | null = null;

            for (const path of paths) {
                // If a path doesn't extend this far, we are done checking this level
                if (path.length <= i) {
                    current = null;
                    finished = true;
                    break;
                }

                if (current == null) {
                    // All other paths checked against this level of the first path
                    current = path[i]
                }
                else if (path[i] !== current) {
                    // A path doesn't match the first path, we are done checking this level
                    current = null;
                    finished = true;
                    break;
                }
            }

            // If current is set, all paths are matching at this index, move the root forward
            if (current != null) {
                root = current;
            }

            i ++;
        }
    }

    return root;
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
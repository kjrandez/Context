import {Component} from 'react';
import {observable, autorun} from 'mobx';
import {Proxy} from './client';
import {NumDict, Model, Value, PageValue} from './types';

interface ViewNode {
    element: Proxy,
    expanded: boolean,
    selected: boolean,
    children: NumDict<ViewNode>,
    component: Component | null
}

function viewNode(element: Proxy, expanded: boolean) {
    return observable({
        element,
        expanded,
        selected: false,
        children: {},
        component: null
    } as ViewNode)
}

export async function newStore(rootPage: Proxy) {
    let store = new Store(viewNode(rootPage, true), {}, []);
    await store.initialize();
    return store;
}

export class Store
{
    private receiverMap: NumDict<number[][]> = {};

    constructor(
        public root: ViewNode,
        public db: NumDict<Model<Value>>,
        public selection: number[][]
    ) {}

    async initialize() {
        await this.refreshHierarchy(this.root, 0); 
    }

    lookupNode(path: number[]) {
        return traverse(this.root, path);
    }

    expand(path: number[]) {
        let node = traverse(this.root, path);
        node.expanded = true;

        // Queue up hiearchy refresh for the now greater depth
        setTimeout(() => this.refreshHierarchy(node, 0).then(), 0);
    }

    collapse(path: number[]) {
        let node = traverse(this.root, path);
        node.expanded = false;
    }

    select(path: number[], ctrlDown: boolean) {
        let refreshPaths = [...this.selection, path];

        if (ctrlDown) {
            let index = findPath(this.selection, path);
            if (index !== null) {
                // Remove from selection list if ctrl down and it's already present
                let removedPath = this.selection.splice(index, 1)[0];
                this.lookupNode(removedPath).selected = false;
            } else {
                // Add to selection list if ctrl down and it's not already present
                this.selection.push(path);
                this.lookupNode(path).selected = true;
            }
        } else {
            // Otherwise swap selection out completely
            this.selection.forEach(path => this.lookupNode(path).selected = false);
            this.selection = [path];
            this.lookupNode(path).selected = true;
        }
    }

    async broadcast(element: Proxy) {
        if (this.db[element.id] === undefined) {
            console.log("Broadcast for element not in database");
            return;
        }

        // Merge new model into dictionary
        let newModel = await element.call<Model<Value>>('model', []);
        let model = this.db[element.id];
        if (model === undefined) {
            model = observable(newModel)
            this.db[element.id] = model;
        } else {
            model.type = newModel.type;
            model.value = newModel.value;
        }
    }

    private async fetchModel(element: Proxy) {
        let model = this.db[element.id] as Model<Value>;
        if (model === undefined) {
            model = await element.call<Model<Value>>('model', []);
            this.db[element.id] = observable(model);
        }
        return model;
    }
    
    private async refreshHierarchy(node: ViewNode, collapsedDepth: number) {
        // Lookup model, pulling from kernel if not yet present
        let {type, value} = await this.fetchModel(node.element) as Model<PageValue>;
    
        // No further refresh if this is a leaf node
        if (type !== "Page")
            return;
    
        let present = [];
        for (const {key, element} of value.entries) {
            present.push(key.toString());

            // Look up previous or create new nodes for all children in this page model
            let child = node.children[key];
            if (child === undefined) {
                child = viewNode(element, false);
                node.children[key] = child;
            }

            // Recurse until past safe depth of collapsed pages
            if (collapsedDepth < 1)
                await this.refreshHierarchy(child, collapsedDepth + (node.expanded ? 0 : 1))
        };
        
        // Remove stale keys
        for (const key in node.children) {
            if (!present.includes(key))
                delete node.children[key]
        }
    }
}

function traverse(node: ViewNode, path: number[]): ViewNode {
    if (path.length === 0)
        return node;

    let child = node.children[path[0]];
    console.assert(child !== undefined);
    return traverse(child, path.slice(1));
}

function pathsEqual(pathA: number[], pathB: number[]) {
    if (pathA.length !== pathB.length)
        return false;

    while (pathA.length > 0) {
        if (pathA[0] !== pathB[0])
            return false;
        pathA = pathA.slice(1);
        pathB = pathB.slice(1);
    }

    return true;
}

export function findPath(paths: number[][], path: number[]): number | null {
    for (let i = 0; i < paths.length; i++) {
        if (pathsEqual(paths[i], path)) {
            return i;
        }
    }

    return null;
}

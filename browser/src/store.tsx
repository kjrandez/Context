import {Component} from 'react';
import {Proxy} from './client';
import {NumDict, Model, Value, PageValue} from './types';

class ViewNode
{
    public children: NumDict<ViewNode>;
    public component: Component | null;

    constructor(public element: Proxy<Value>, public expanded: boolean) {
        this.children = {};
        this.component = null;
    }
}

export async function newStore(rootPage: Proxy<PageValue>) {
    let store = new Store(new ViewNode(rootPage, true), {});
    await store.initialize();
    return store;
}

export class Store
{
    private receiverMap: NumDict<number[][]> = {};

    constructor(public root: ViewNode, public db: NumDict<Model<Value>>) {}

    async initialize() {
        await this.refreshHierarchy(this.root, 0); 
    }    

    bind(path: number[], component: Component) {
        let node = traverseOptional(this.root, path);
        if (node === undefined) {
            console.log("WARNING: Tried binding to node not present in hierarchy.");
            return;
        }

        console.assert(node.component === null);
        node.component = component;
    }

    unbind(path: number[], component: Component) {
        let node = traverseOptional(this.root, path);

        // Hieararchy was likely refreshed prior to a re-render causing component to unmount
        if (node === undefined)
            return;

        console.assert(node.component === component);
        node.component = null;
    }

    subscribe(path: number[], eid: number) {
        let receivers = this.receiverMap[eid];
        if (receivers === undefined) {
            receivers = []
            this.receiverMap[eid] = receivers;
        }

        let pathIndex = findPath(receivers, path);
        console.assert(pathIndex === null);

        receivers.push(path);
    }

    unsubscribe(path: number[], eid: number) {
        let receivers = this.receiverMap[eid];

        let pathIndex = findPath(receivers, path);
        console.assert(pathIndex !== null);

        if (pathIndex !== null)
            receivers.splice(pathIndex, 1);
    }

    expand(path: number[]) {
        let node = traverse(this.root, path);
        node.expanded = true;

        this.refreshComponentAtPath(path);
        
        // Queue up hiearchy refresh for the now greater depth
        setTimeout(() => this.refreshHierarchy(node, 0).then(), 0);
    }

    collapse(path: number[]) {
        let node = traverse(this.root, path);
        node.expanded = false;

        this.refreshComponentAtPath(path);
    }

    async broadcast(element: Proxy<Value>) {
        if (this.db[element.id] === undefined) {
            console.log("Broadcast for element not in database");
            return;
        }

        // Merge new model into dictionary
        let newModel = await element.call<Model<Value>>('model', []);
        this.db[element.id] = newModel;

        let receivers = this.receiverMap[element.id];
        if (receivers === undefined || receivers.length === 0) {
            console.log("Broadcast for unsubscribed element");
            return;
        }

        let refreshPath = commonPath(receivers);
        let refreshNode = traverse(this.root, refreshPath)

        // Update the hierarchy at common path if broadcast element was a page
        if (newModel.type === "Page") {
            console.log("Refreshing hierarchy at: ");
            console.log(refreshPath);

            await this.refreshHierarchy(refreshNode, 0);
        }

        this.refreshComponent(refreshNode);
    }

    private refreshComponentAtPath(path: number[]) {
        this.refreshComponent(traverse(this.root, path));
    }

    private refreshComponent(node: ViewNode) {
        console.assert(node.component !== null);
        if (node.component !== null)
            node.component.forceUpdate();
    }

    private async fetchModel<T>(element: Proxy<T>) {
        let model = this.db[element.id] as Model<any>;
        if (model === undefined) {
            model = await element.call<Model<any>>('model', []);
            this.db[element.id] = model;
        }
        return model;
    }
    
    private async refreshHierarchy(node: ViewNode, collapsedDepth: number) {
        // Lookup model, pulling from kernel if not yet present
        let {type, value} = await this.fetchModel<Model<PageValue>>(node.element);
    
        // No further refresh if this is a leaf node
        if (type !== "Page")
            return;
    
        let children: NumDict<ViewNode> = {}
        for (const {key, element} of value.entries) {
            // Look up previous or create new nodes for all children in this page model
            let child = node.children[key];
            if (child === undefined)
                child = new ViewNode(element, false);
            children[key] = child;
    
            // Recurse until past safe depth of collapsed pages
            if (collapsedDepth < 1)
                await this.refreshHierarchy(child, collapsedDepth + (node.expanded ? 0 : 1))
        };
    
        node.children = children;
    }
}

export function traverse(node: ViewNode, path: number[]): ViewNode {
    if (path.length === 0)
        return node;

    let child = node.children[path[0]];
    console.assert(child !== undefined);
    return traverse(child, path.slice(1));
}

function traverseOptional(node: ViewNode, path: number[]): ViewNode | undefined {
    if (node === undefined || path.length === 0)
        return node;

    let child = node.children[path[0]];
    return traverseOptional(child, path.slice(1))
}

function commonPath(paths: number[][]) {
    let common = [];

    while (true) {
        let depth = common.length as number;
        if (paths[0].length - 1 < depth)
            return common;
        let index = paths[0][depth];

        for (const path of paths.slice(1)) {
            if ((path.length - 1 < depth) || (path[depth] !== index)) {
                return common;
            }
        }
        common.push(index);
    }
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

function findPath(paths: number[][], path: number[]): number | null {
    for (let i = 0; i < paths.length; i++) {
        if (pathsEqual(paths[i], path)) {
            return i;
        }
    }

    return null;
}

import {Component} from 'react';
import {observable, action} from 'mobx';
import {Proxy} from '../client';
import {NumDict, Model, Value} from '../types';
import PageActions from './page';
import TextActions from './text';
import HierarchyActions from './hierarchy';

export interface ViewNode {
    element: Proxy,
    expanded: boolean,
    selected: boolean,
    children: NumDict<ViewNode>,
    component: Component | null
}

export interface ViewState {
    root: ViewNode,
    db: NumDict<Model<Value>>,
    selection: number[] | null
}

export function viewNode(element: Proxy, expanded: boolean) {
    return observable({
        element,
        expanded,
        selected: false,
        children: {},
        component: null
    });
}

export function viewState(rootPage: Proxy) {
    return observable({
        root: viewNode(rootPage, true),
        db: {},
        selection: null
    })
}

export class Store
{
    private state: ViewState;

    public pageAction: PageActions;
    public textAction: TextActions;
    public hierarchyAction: HierarchyActions;

    constructor(rootPage: Proxy) {
        this.state = viewState(rootPage);
        this.pageAction = new PageActions(this.state);
        this.textAction = new TextActions(this.state);
        this.hierarchyAction = new HierarchyActions(this.state);
    }

    lookupModel(eid: number) {
        return this.state.db[eid];
    }

    lookupNode(path: number[]) {
        return traverse(this.state.root, path);
    }

    selection() {
        return this.state.selection;
    }

    @action
    deselect() {
        if (this.state.selection !== null) {
            this.lookupNode(this.state.selection).selected = false;
            this.state.selection = null;
        }
    }

    @action
    select(path: number[]) {
        if (this.state.selection !== null)
            if (pathsEqual(this.state.selection, path))
                return;

        this.deselect();
        
        this.state.selection = path;
        this.lookupNode(path).selected = true;
    }
}

export function traverse(node: ViewNode, path: number[]): ViewNode {
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

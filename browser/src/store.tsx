import {Proxy} from './client';
import {NumDict, Model, PageValue} from './types';

export type Database = NumDict<Model<any>>;
export type ViewNode = {expanded: boolean, children: NumDict<ViewNode>};
export type Store = {db: Database, root: ViewNode};

export async function initialize(rootPage: Proxy<PageValue>): Promise<Store> {
    let db: Database = {}
    let rootPageModel = await fetchModel<PageValue>(rootPage, db);
    let root = await refresh({expanded: true, children: {}}, rootPageModel.value, db, true);

    return {db, root}
}

async function fetchModel<T>(element: Proxy<T>, db: Database) {
    let model = db[element.id] as Model<any>;
    if (model === undefined) {
        model = await element.call<Model<any>>('model', []);
        db[element.id] = model;
    }
    return model;
}

// Normal element model update should go directly to that element
// and re-render at the most common root

// Page expand should change the expanded flag, render, then perform a refresh at the node
// previous traversal should have yielded enough depth that the refresh would not reuqire
// a further render

// Page model updating similarly goes directly to that element
// then refresh is issued at the common root, followed by render


export async function refresh(
    node: ViewNode, value: PageValue, db: Database, deeper: boolean
): Promise<ViewNode> {
    let children: NumDict<ViewNode> = {}
    for (const {key, element} of value.entries) {
        let model = await fetchModel<Model<PageValue>>(element, db);
        if (model.type !== "Page")
            continue;
        
        let childNode = node.children[key];
        if (childNode === undefined)
            childNode = {expanded: false, children: {}};
        
        children[key] = deeper ?
            await refresh(childNode, model.value, db, node.expanded) :
            childNode;
    };

    return {expanded: node.expanded, children};
}


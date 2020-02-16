import {NumDict, Model, PageModel} from './types';

export type Database = NumDict<Model>;
export type ViewNode = {expanded: boolean, children: NumDict<ViewNode>};
export type Store = {db: Database, root: ViewNode};

// This module will be responsible for maintaining the database and view hierarchy for now...

// On connect, kernel will provide an RPC interface... use that to get the top level page
// start hierarchy object "0" with expanded=True .. not possible to build hierarchy since
// element is missing from the database, so request from the database

// Database fulfills model .. 

function refresh(root: ViewNode, eid: number, db: Database, missing: number[]): ViewNode {
    let model = db[eid] as PageModel;
    if (model === undefined) {
        if (!missing.includes(eid))
            missing.push(eid);
        return root;
    }
    
    let children: NumDict<ViewNode> = {}
    model.entries.forEach(entry => {
        let child = root.children[entry.index];
        if (child === undefined)
            child = {expanded: false, children: {}};

        children[entry.index] = refresh(child, entry.eid, db, missing);
    });

    return {expanded: root.expanded, children};
}

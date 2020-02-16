import React, { Component, ReactElement } from 'react';
import { ElementProps, Text, Unknown } from '.';
import { Store, ViewNode, PageModel } from '../types';

function traverse(node: ViewNode, path: number[]): ViewNode {
    if (node === undefined || path.length === 0)
        return node
    
    let index = path[0]; 
    return traverse(node.children[index], path.slice(1))
}

function element(store: Store, path: number[], eid: number)
{
    let model = store.db[eid];
    if (model === undefined)
        return <p>&lt;!&gt; Element not in local database</p>

    let childProps = {store, eid, path, key: path.slice(-1)[0]}
    switch (model.type) {
        case "page": return <Page {...childProps} />
        case "text": return <Text {...childProps} />
        default: return <Unknown {...childProps} />
    }
}

function test()
{
    console.log("sawefaw")
}

export default class Page extends Component<ElementProps>
{
    render(): ReactElement {
        const {props: {store, eid, path}} = this;

        let node = traverse(store.root, path);
        if (node === undefined)
            return <p>&lt;!&gt; Page path {path.toString()} not in hierarchy</p>

        let model = store.db[eid] as PageModel;
        let contents = (node.expanded) ?
            model.entries.map(entry => element(store, [...path, entry.index], entry.eid)) :
            <p>-> Expand</p>;

        return(
            <div style={{marginLeft: "2px"}}>
                <p onClick={() => test()}>Page:</p>
                <div
                    style={{
                        borderLeft: "1px solid black",
                        marginLeft: "2px",
                        paddingLeft: "10px"}}>
                    {contents}
                </div>
            </div>
        );
    }
}

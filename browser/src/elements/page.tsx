import React, {Component, ReactElement} from 'react';
import {ElementProps, Text, Unknown} from '.';
import {Store, ViewNode} from '../store';
import {Model, PageValue} from '../types';

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
        return <p>&lt;!&gt; Element model missing from database</p>

    let childProps = {store, model, path, key: path.slice(-1)[0]}
    switch (model.type) {
        case "Page": return <Page {...childProps} />
        case "Text": return <Text {...childProps} />
        default: return <Unknown {...childProps} />
    }
}

interface PageProps extends ElementProps { model: Model<PageValue> }

export default class Page extends Component<PageProps>
{
    render(): ReactElement {
        const {props: {store, model, path}} = this;

        let node = traverse(store.root, path);
        if (node === undefined)
            return <p>&lt;!&gt; Page path {path.toString()} not in hierarchy</p>

        let {value: {entries}} = model;
        let contents = (node.expanded) ?
            entries.map(entry => element(store, [...path, entry.key], entry.element.id)) :
            <p>-> Expand</p>;

        return(
            <div style={{marginLeft: "2px"}}>
                <p>Page ({this.props.model.id}):</p>
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

import {observer} from 'mobx-react';
import React, {Component, ReactElement, MouseEvent} from 'react';
import {Value, TextValue, PageValue} from '../types';
import {Store, findPath} from '../store';

import Text from './text';
import Page from './page';
import Unknown from './unknown';

export {Page};

export interface ElementProps {
    store: Store;
    type: string;
    eid: number;
    value: Value;
    path: number[];
}

class Element extends Component<{store: Store; path: number[]; eid: number}>
{
    onMouseDown(event: MouseEvent) {
        this.props.store.select(this.props.path, event.ctrlKey);
        event.stopPropagation();
    }

    render(): ReactElement {
        let {store, path, eid} = this.props;
        let model = store.db[eid];
        if (model === undefined)
            return <p>&lt;!&gt; Element model missing from database</p>

        let {type, value} = model;
        let childProps = {store, path, type, eid: model.id, key: path.slice(-1)[0]}
        let visual = null;
        
        let selected = store.lookupNode(path).selected;

        switch (type) {
            case "Text": visual = <Text value={value as TextValue} {...childProps} />; break;
            case "Page": visual = <Page value={value as PageValue} {...childProps} />; break;
            default: visual = <Unknown value={value} {...childProps} />; break;
        }

        return (
            <div 
                style={{backgroundColor: selected ? "black" : "white"}}
                onMouseDown={(ev) => this.onMouseDown(ev)}>
                {visual}
            </div>
        );
    }
}

export default observer(Element);
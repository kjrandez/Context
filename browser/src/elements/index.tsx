import {observer} from 'mobx-react';
import React, {Component, ReactElement, MouseEvent} from 'react';
import {Value, TextValue, PageValue} from '../types';
import {Store} from '../store';

import Text, {Script} from './text';
import NestedPage from './nestedPage';
import Unknown from './unknown';
export {default as Page} from './page';

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
        console.log("click!");
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
            case "Page": visual = <NestedPage value={value as PageValue} {...childProps} />; break;
            case "Script": visual = <Script value={value as TextValue} {...childProps} />; break;
            default: visual = <Unknown value={value} {...childProps} />; break;
        }

        return (
            <div
                className={"element" + (selected ? " selected" : "")}
                onMouseDown={(ev) => this.onMouseDown(ev)}>
                <div className="element-content">
                    {visual}
                </div>
            </div>
        );
    }
}

export default observer(Element);
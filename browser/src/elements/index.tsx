import {observer} from 'mobx-react';
import React, {Component, ReactElement, MouseEvent} from 'react';
import {Value, TextValue, PageValue} from '../types';
import {Store} from '../store';

import {Script, Markdown} from './text';
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
    onClick(event: MouseEvent) {
        // Select element if click was not due to text range selection
        var selection = window.getSelection();
        if(selection !== null && selection.type !== "Range")
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
            case "Text": visual = <Markdown value={value as TextValue} {...childProps} />; break;
            case "Page": visual = <NestedPage value={value as PageValue} {...childProps} />; break;
            case "Script": visual = <Script value={value as TextValue} {...childProps} />; break;
            default: visual = <Unknown value={value} {...childProps} />; break;
        }

        return (
            <div
                className={"element" + (selected ? " selected" : "")}
                onClick={(ev) => this.onClick(ev)}> 
                <div className="element-content">
                    {visual}
                </div>
            </div>
        );
    }
}

export default observer(Element);
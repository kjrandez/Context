import {observer} from 'mobx-react';
import React, {Component, ReactElement, MouseEvent} from 'react';
import {Model, Value, TextValue, PageValue} from '../../types';
import {Store} from '../../store';

import {Script, Text} from './text';
import NestedPage from './nestedPage';
import Unknown from './unknown';
export {default as Page} from './page';

export interface ElementProps {
    store: Store;
    path: number[];
    model: Model<Value>;
}

class PageEntry extends Component<{store: Store; path: number[]; eid: number}>
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
        let model = store.lookupModel(eid);

        let childProps = {store, path, key: path.slice(-1)[0]}
        let selected = store.lookupNode(path).selected;
        let visual = (() => {
            switch (model.type) {
                case "Text":
                    return <Text model={model as Model<TextValue>} {...childProps} />;
                case "Page":
                    return <NestedPage model={model as Model<PageValue>} {...childProps} />;
                case "Script":
                    return <Script model={model as Model<TextValue>} {...childProps} />;
                default:
                    return <Unknown model={model} {...childProps} />;
            }
        })();

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

export default observer(PageEntry);
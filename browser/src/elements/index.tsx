import React, {Component, ReactElement} from 'react';
import {Model, Value, TextValue, PageValue} from '../types';
import {Store} from '../store';

import Text from './text';
import Page from './page';
import Unknown from './unknown';

export {Page};

export interface ElementProps {
    store: Store;
    model: Model<Value>
    path: number[];
}

export default class Element extends Component<{store: Store; path: number[]; eid: number}>
{
    componentDidMount() {
        let {store, path, eid} = this.props;
        store.mount(path, this);
        store.subscribe(path, eid);
    }

    componentWillUnmount() {
        let {store, path, eid} = this.props;
        store.unsubscribe(path, eid);
        store.unmount(path, this);
    }

    componentDidUpdate() {}

    render(): ReactElement {
        let {store, path, eid} = this.props;
        let model = store.db[eid];
        if (model === undefined)
        return <p>&lt;!&gt; Element model missing from database</p>

        let childProps = {store, path, key: path.slice(-1)[0]}
        switch (model.type) {
            case "Text": return <Text model={model as Model<TextValue>} {...childProps} />
            case "Page": return <Page model={model as Model<PageValue>} {...childProps} />
            default: return <Unknown model={model} {...childProps} />
        }
    }
}

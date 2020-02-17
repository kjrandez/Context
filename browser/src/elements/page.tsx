import React, {Component, ReactElement} from 'react';
import Element, {ElementProps} from '.';
import {traverse} from '../store';
import {Model, PageValue} from '../types';


interface PageProps extends ElementProps { model: Model<PageValue> }

export default class Page extends Component<PageProps>
{
    entries() {
        const {store, model, path} = this.props;

        return model.value.entries.map(
            ({key, element}) =>
                <Element
                    store={store}
                    path={[...path, key]}
                    eid={element.id}
                    key={key} />
        );
    }

    expandLink(expanded: boolean) {
        let {store, path} = this.props;

        if (!expanded)
            return <button onClick={()=>store.expand(path)}>Expand</button>
        else
            return <button onClick={()=>store.collapse(path)}>Collapse</button>
    }

    render(): ReactElement {
        const {store, path} = this.props;

        let node = traverse(store.root, path);

        return(
            <div style={{marginLeft: "2px"}}>
                <p>Page ({this.props.model.id}) {this.expandLink(node.expanded)}</p>
                <div
                    style={{
                        borderLeft: "1px solid black",
                        marginLeft: "2px",
                        paddingLeft: "10px"}}>
                    {(node.expanded) ? this.entries() : null}
                </div>
            </div>
        );
    }
}

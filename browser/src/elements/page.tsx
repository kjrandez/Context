import React, {Component, ReactElement} from 'react';
import Element, {ElementProps} from '.';
import {Model, PageValue} from '../types';
import { observer } from 'mobx-react';


interface PageProps extends ElementProps { value: PageValue }

class Page extends Component<PageProps>
{
    entries() {
        const {store, value, path} = this.props;

        return value.entries.map(
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

        let node = store.lookupNode(path);

        return(
            <div style={{marginLeft: "2px"}}>
                <p>Page ({this.props.eid})</p>
                <div
                    style={{
                        borderLeft: "1px solid black",
                        marginLeft: "2px",
                        paddingLeft: "10px"}}>
                    <p>{this.expandLink(node.expanded)}</p>
                    {(node.expanded) ? this.entries() : null}
                </div>
            </div>
        );
    }
}

export default observer(Page);
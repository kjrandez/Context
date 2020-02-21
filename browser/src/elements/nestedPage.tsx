import React, {Component, ReactElement} from 'react';
import Page, {PageProps} from './page';
import {observer} from 'mobx-react';

class NestedPage extends Component<PageProps>
{
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
                    {(node.expanded) ? <Page {...this.props} /> : null}
                </div>
            </div>
        );
    }
}

export default observer(NestedPage);
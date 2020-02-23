import React, {Component, ReactElement} from 'react';
import Page, {PageProps} from './page';
import {observer} from 'mobx-react';

class NestedPage extends Component<PageProps>
{
    expandLink(expanded: boolean) {
        let {store, path} = this.props;

        if (!expanded)
            return <button onClick={()=>store.hierarchyAction.expand(path)}>-</button>
        else
            return <button onClick={()=>store.hierarchyAction.collapse(path)}>|</button>
    }

    render(): ReactElement {
        const {store, path} = this.props;

        let node = store.lookupNode(path);

        return(
            <div>
                <p>
                    {this.expandLink(node.expanded)}
                    <span className="title">Page({this.props.model.id})</span>
                </p>
                <div
                    style={{
                        borderLeft: "1px solid",
                        marginLeft: "14px",
                        paddingLeft: "9px"}}>
                    {(node.expanded) ? <Page {...this.props} /> : null}
                </div>
            </div>
        );
    }
}

export default observer(NestedPage);
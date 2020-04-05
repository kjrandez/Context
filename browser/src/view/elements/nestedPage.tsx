import React, {Component, ReactElement, MouseEvent} from 'react';
import Page, {PageProps} from './page';
import {observer} from 'mobx-react';

class NestedPage extends Component<PageProps>
{
    onClick(ev: MouseEvent<HTMLButtonElement>, expand: boolean) {
        ev.stopPropagation();
        
        const {store, path} = this.props;
        const action = expand ? 'expand' : 'collapse';

        store.hierarchyAction[action](path);
    }

    expandLink(expanded: boolean) {
        if (!expanded)
            return <button onClick={(ev) => this.onClick(ev, true)}>-</button>
        else
            return <button onClick={(ev) => this.onClick(ev, false)}>|</button>
    }

    render(): ReactElement {
        const {store, path} = this.props;

        let node = store.lookupNode(path);

        return(
            <div>
                <p>
                    {this.expandLink(node.expanded)}
                    <span className="title"> Page({this.props.model.eid})</span>
                </p>
                <div
                    style={{
                        borderLeft: "1px solid",
                        marginLeft: "10px",
                        paddingLeft: "5px"}}>
                    {(node.expanded) ? <Page {...this.props} /> : null}
                </div>
            </div>
        );
    }
}

export default observer(NestedPage);
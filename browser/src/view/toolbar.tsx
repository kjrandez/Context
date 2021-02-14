import React, {Component, ReactElement} from 'react';
import {Store} from '../store';
import {observer} from 'mobx-react';

class Toolbar extends Component<{store: Store}>
{
    toolbarContents(selection: number[]): ReactElement {
        let {store} = this.props;
        let node = store.lookupNode(selection);
        let element = node.element;
        let model = store.lookupModel(element.id);

        return <>
            {model.type + "(" + model.id.toString() + ")"}&nbsp;
            <button onClick={() => store.pageAction.delete(selection)}>Delete</button>
        </>
    }

    render(): ReactElement {
        let selection = this.props.store.selection();
        
        return(
            <div id="toolbar">
                {selection !== null ? this.toolbarContents(selection) : <>&nbsp;</>}
            </div>
        );
    }
}

export default observer(Toolbar);

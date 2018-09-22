import React, {Component} from 'react';
import {Button, ButtonGroup, Divider} from '@blueprintjs/core';

export default class ScriptInspector extends Component
{
    run(threaded) {
        var parentKey = this.props.path[this.props.path.length - 1];
        var parent = this.props.app.store.fragment(parentKey)

        this.props.fragment.invoke({
            selector: "execute",
            arguments: [parent, threaded]
        });
    }

    render() {
        return(
            <ButtonGroup minimal={false} vertical="true" onMouseEnter={()=>{}}>
                <Button icon="publish-function" onClick={()=>this.run(false)}></Button>
                <Button icon="derive-column" onClick={()=>this.run(true)}></Button>
                <Divider />
                <Button icon="pin"></Button>
                <Button icon="duplicate"></Button>
                <Button icon="cut"></Button>
                <Divider />
                <Button icon="info-sign"></Button>
            </ButtonGroup>
        );
    }
}

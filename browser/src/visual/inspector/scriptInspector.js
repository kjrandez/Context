import React, { Component } from 'react';
import { Button, ButtonGroup, Divider } from '@blueprintjs/core';
import { commonInspectorButtons } from './shared';

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
                <Button title="Run script" icon="publish-function" onClick={()=>this.run(false)}></Button>
                <Button title="Run in thread" icon="derive-column" onClick={()=>this.run(true)}></Button>
                <Divider />
                {commonInspectorButtons(
                    this.props.path,
                    this.props.index,
                    this.props.fragment,
                    this.props.app
                )}
            </ButtonGroup>
        );
    }
}

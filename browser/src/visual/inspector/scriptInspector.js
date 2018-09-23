import React, { Component } from 'react';
import { Button, ButtonGroup, Divider } from '@blueprintjs/core';
import { commonInspectorButtons } from './shared';

export default class ScriptInspector extends Component
{
    run(threaded) {
        var path = this.props.loc.path;
        var parentId = path[path.length - 1];
        var parent = this.props.app.store.fragment(parentId)

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
                    this.props.loc,
                    this.props.fragment,
                    this.props.app
                )}
            </ButtonGroup>
        );
    }
}

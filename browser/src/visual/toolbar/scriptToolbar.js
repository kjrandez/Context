import React, { Component } from 'react';
import { Intent, Tooltip, Button } from '@blueprintjs/core';

export default class ScriptToolbar extends Component
{
    run(threaded) {
        var path = this.props.loc.path;
        var parentId = path[path.length - 1];
        var parent = this.props.app.store.fragment(parentId)

        if(threaded)
            this.props.fragment.invokeBackground("execute", [parent])
        else
            this.props.fragment.invoke("execute", [parent]);
    }

    render() {
        return([
            <Tooltip key="1" content="Run script" intent={Intent.PRIMARY} hoverOpenDelay={250}>
                <Button icon="publish-function" intent={Intent.PRIMARY}
                onClick={()=>this.run(false)}></Button>
            </Tooltip>,
            
            <Tooltip key="2" content="Run in thread" intent={Intent.PRIMARY} hoverOpenDelay={250}>
                <Button icon="derive-column" intent={Intent.PRIMARY} minimal={true}
                onClick={()=>this.run(true)}></Button>
            </Tooltip>
        ]);
    }
}

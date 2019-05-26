import React, { Component } from 'react';
import { Intent, Tooltip, Button } from '@blueprintjs/core';

export default class ScriptToolbar extends Component
{
    render() {
        return([
            <Tooltip key="1" content="Run script" intent={Intent.PRIMARY} hoverOpenDelay={250}>
                <Button icon="publish-function" intent={Intent.PRIMARY}
                onClick={()=>this.action.run(this.props.tag, false)}></Button>
            </Tooltip>,
            
            <Tooltip key="2" content="Run in thread" intent={Intent.PRIMARY} hoverOpenDelay={250}>
                <Button icon="derive-column" intent={Intent.PRIMARY} minimal={true}
                onClick={()=>this.action.run(this.props.tag, true)}></Button>
            </Tooltip>
        ]);
    }
}

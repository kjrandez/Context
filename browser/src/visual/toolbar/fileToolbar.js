import React, { Component } from 'react';
import { Intent, Tooltip, Button } from '@blueprintjs/core';

export default class FileToolbar extends Component
{
    render() {
        return([
            <Tooltip key="2" content="Open with default" intent={Intent.PRIMARY} hoverOpenDelay={250}>
                <Button icon="application" intent={Intent.PRIMARY}
                onClick={()=>this.props.action.openInDefault()}></Button>
            </Tooltip>,

            <Tooltip key="1" content="Locate in explorer" intent={Intent.PRIMARY} hoverOpenDelay={250}>
                <Button icon="add-to-folder" intent={Intent.PRIMARY} minimal={true}
                onClick={()=>this.props.action.openInExplorer()}></Button>
            </Tooltip>
        ]);
    }
}

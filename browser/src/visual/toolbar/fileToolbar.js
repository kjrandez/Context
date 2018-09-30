import React, { Component } from 'react';
import { Intent, Tooltip, Button } from '@blueprintjs/core';

export default class FileToolbar extends Component
{
    openInDefault() {
        this.props.fragment.invokeBackground("openInDefault", [])
    }

    openInExplorer() {
        this.props.fragment.invokeBackground("openInExplorer", [])
    }

    render() {
        return([
            <Tooltip key="2" content="Open with default" intent={Intent.PRIMARY} hoverOpenDelay={250}>
                <Button icon="application" intent={Intent.PRIMARY}
                onClick={()=>this.openInDefault()}></Button>
            </Tooltip>,

            <Tooltip key="1" content="Locate in explorer" intent={Intent.PRIMARY} hoverOpenDelay={250}>
                <Button icon="add-to-folder" intent={Intent.PRIMARY} minimal={true}
                onClick={()=>this.openInExplorer()}></Button>
            </Tooltip>
        ]);
    }
}

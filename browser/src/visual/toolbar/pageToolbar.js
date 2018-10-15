import React, { Component } from 'react';
import { Intent, Tooltip, Button } from '@blueprintjs/core';

export default class PageToolbar extends Component
{
    render() {
        return([
            <Tooltip key="1" content="Go to page" intent={Intent.PRIMARY} hoverOpenDelay={250}>
                <Button icon="log-in" intent={Intent.PRIMARY}
                onClick={() => this.props.action.enterPage(this.props.tag)}></Button>
            </Tooltip> 
        ]);
    }
}

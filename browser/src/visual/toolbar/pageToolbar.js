import React, { Component } from 'react';
import { Intent, Tooltip, Button } from '@blueprintjs/core';

export default class PageToolbar extends Component
{
    enterPage() {
        var path = this.props.loc.path;
        this.props.app.enterPage(path, this.props.fragment.id());
    }

    render() {
        return([
            <Tooltip key="1" content="Go to page" intent={Intent.PRIMARY} hoverOpenDelay={250}>
                <Button icon="log-in" intent={Intent.PRIMARY}
                onClick={() => this.enterPage()}></Button>
            </Tooltip> 
        ]);
    }
}

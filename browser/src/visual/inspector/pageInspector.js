import React, { Component } from 'react';
import { Button, ButtonGroup, Divider } from '@blueprintjs/core';
import { commonInspectorButtons } from './shared';

export default class PageInspector extends Component
{
    enterPage() {
        var path = this.props.loc.path;
        this.props.app.enterPage(path, this.props.fragment.id());
    }

    render() {
        return(
            <ButtonGroup minimal={false} vertical="true" onMouseEnter={()=>{}}>
                <Button title="Go to page"
                icon="document-open"
                onClick={() => this.enterPage()}></Button>
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

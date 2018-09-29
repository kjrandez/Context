import React, { Component } from 'react';
import { Button } from '@blueprintjs/core';

export default class PageInspector extends Component
{
    enterPage() {
        var path = this.props.loc.path;
        this.props.app.enterPage(path, this.props.fragment.id());
    }

    render() {
        return([
                <Button
                key="1"
                title="Go to page"
                icon="document-open"
                onClick={() => this.enterPage()}></Button>
        ]);
    }
}

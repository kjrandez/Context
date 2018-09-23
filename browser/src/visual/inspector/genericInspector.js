import React, { Component } from 'react';
import { ButtonGroup } from '@blueprintjs/core';
import { commonInspectorButtons } from './shared';

export default class GenericInspector extends Component
{
    run(threaded) {
        var parentId = this.props.path[this.props.path.length - 1];
        var parent = this.props.app.store.fragment(parentId)

        this.props.fragment.invoke({
            selector: "execute",
            arguments: [parent, threaded]
        });
    }

    render() {
        return(
            <ButtonGroup minimal={false} vertical="true" onMouseEnter={()=>{}}>
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

import React, { Component } from 'react';
import { ButtonGroup } from '@blueprintjs/core';
import { commonInspectorButtons } from './shared';

export default class GenericInspector extends Component
{
    render() {
        return(
            <ButtonGroup minimal={false} vertical="true" onMouseEnter={()=>{}}>
                {commonInspectorButtons(
                    this.props.loc,
                    this.props.fragment,
                    this.props.app
                )}
            </ButtonGroup>
        );
    }
}

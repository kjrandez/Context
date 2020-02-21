import React, {Component, ReactElement} from 'react';
import {ElementProps} from '.';

export default class Unknown extends Component<ElementProps>
{
    render(): ReactElement {
        return <p>Unknown Type {this.props.type} [{this.props.eid}]</p>;
    }
}

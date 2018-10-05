import React, {Component} from 'react';
import { Icon } from '@blueprintjs/core';

export default class FileRef extends Component
{
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(ev) {
        this.props.action.openInDefault();
        ev.preventDefault();
    }

    render() {
        return(
            <div>
            <span className="file-content">
                <Icon icon="document" />
                <a onClick={this.onClick}>
                    {this.props.value.filename}
                </a>
            </span>
            </div>
        );
    }
}

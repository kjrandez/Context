import React, {Component} from 'react';
import {Icon} from '@blueprintjs/core';

export default class FileRef extends Component
{
    constructor(props) {
        super(props);

        var value = this.props.fragment.value();
        this.state = {
            path: value.path,
            filename: value.filename
        }
    }

    modelChanged() {
        var value = this.props.fragment.value();

        this.setState({
            href: value.href
        });
    }

    onClick(ev) {
        this.props.fragment.invokeBackground("openInDefault", []);
        ev.preventDefault();
    }

    render() {
        return(
            <div>
            <span className="file-content">
                <Icon icon="document" />
                <a href="#" onClick={ev => this.onClick(ev)}>{this.state.filename}</a>
            </span>
            </div>
        );
    }

    componentWillMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect(this);
    }
}

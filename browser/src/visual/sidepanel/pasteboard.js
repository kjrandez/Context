import React, { Component } from 'react';

export default class Pasteboard extends Component
{
    componentWillMount() {
        this.props.paste.connect(this);
    }

    componentWillUnmount() {
        this.props.paste.disconnect(this);
    }

    render() {
        return(
            <div className="sidepanel-tab-content">
                <p>Pasteboard id: {this.props.paste.id()}</p>
            </div>
        );
    }
}

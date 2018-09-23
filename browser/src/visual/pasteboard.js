import React, { Component } from 'react';

export default class Pasteboard extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        }
    }

    pasteboardClass() {
        if(this.state.isOpen)
            return "pasteboard-visible";
        return "pasteboard-hidden";
    }

    pasteboardContentClass() {
        if(this.state.isOpen)
            return "pasteboard-content-visible";
        return "pasteboard-content-hidden";
    }

    pasteboardButtonClass() {
        if(this.state.isOpen)
            return "pasteboard-button-visible";
        return "pasteboard-button-hidden";
    }

    expandButtonClass() {
        var className = "bp3-button bp3-minimal bp3-small ";

        if(this.state.isOpen)
            className += "bp3-icon-chevron-left";
        else
            className += "bp3-icon-chevron-right";

        return className;
    }

    onClick(event) {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    onMouseDown(event) {
        event.stopPropagation();
    }

    render() {
        return (
            <div id="pasteboard" className={this.pasteboardClass()}>
                <div id="pasteboard-content" className={this.pasteboardContentClass()}>
                    <div id="pasteboard-panel">
                        Hello world
                    </div>
                </div>
                <div id="pasteboard-button" className={this.pasteboardButtonClass()}>
                    <button
                        type="button"
                        className={this.expandButtonClass()}
                        onMouseDown={(event) => this.onMouseDown(event)}
                        onClick={(event) => this.onClick(event)}>
                    </button>
                </div>
            </div>
        );
    }
}

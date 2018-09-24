import React, { Component } from 'react';
import { NewElement } from '../store';
import { Button, ButtonGroup, Divider, Popover, Icon, Position } from '@blueprintjs/core';

export default class AppendButton extends Component
{
    constructor(props) {
        super(props)

        this.state = {
            defaultActive: false
        };
    }

    onClick(ev) {
        // Should add whatever the default is
        this.addText();
    }

    addText() {
        this.append(new NewElement("Text", [""]));
    }

    addPage() {

    }

    addImage() {

    }

    addScript() {

    }

    append(newElement) {
        var path = this.props.path;
        var fragment = this.props.app.store.fragment(path[path.length - 1])

        fragment.invoke("append", [
            newElement,
            true
        ])

        // The app will store this path
        this.props.app.setGrabPath(this.props.path);
    }

    onMouseDown(event) {
        event.stopPropagation();
    }

    defaultToggle() {
        this.setState({
            defaultActive: !this.state.defaultActive
        });
    }

    appendMoreMenu() {
        return(
            <div className="append-more-menu">
            <ButtonGroup minimal={false} onMouseEnter={()=>{}}>

                <Button icon="new-text-box"
                className="bp3-popover-dismiss"
                onClick={()=>this.addText()}></Button>

                <Button icon="media"
                className="bp3-popover-dismiss"
                onClick={()=>this.addImage()}></Button>

                <Button icon="document"
                className="bp3-popover-dismiss"
                onClick={()=>this.addPage()}></Button>

                <Button icon="function"
                className="bp3-popover-dismiss"
                onClick={()=>this.addScript()}></Button>

                <Divider />

                <Button active={this.state.defaultActive}
                onClick={()=>this.defaultToggle()}>Set Default</Button>

            </ButtonGroup>
            </div>
        )
    }

    render() {
        return(
            <div className="element">
                <div className="element-spacer"></div>
                    <div className="append-button-container">
                        <button className="append-button"
                        onClick={ev => this.onClick(ev)}
                        onContextMenu={ev => this.onClick(ev)}
                        onMouseDown={(ev)=>this.onMouseDown(ev)}></button>
                        <Popover content={this.appendMoreMenu()} position={Position.RIGHT}>
                            <button onMouseDown={(ev)=>this.onMouseDown(ev)} className="append-more-button"><Icon icon="more" /></button>
                        </Popover>
                    </div>
            </div>
        );
    }
}

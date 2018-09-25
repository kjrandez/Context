import React, { Component } from 'react';
import { NewElement } from '../store';
import { Button, ButtonGroup, Divider, Popover, Icon, Position } from '@blueprintjs/core';
import { DropTarget } from 'react-dnd';

class AppendButton extends Component
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
        this.append(new NewElement("Text", []));
    }

    addPage() {
        this.append(new NewElement("Page", []));
    }

    addImage() {
        this.append(new NewElement("Image", []));
    }

    addScript() {
        this.append(new NewElement("Script", []));
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

                <Button icon="document"
                className="bp3-popover-dismiss"
                onClick={()=>this.addPage()}></Button>
                
                <Button icon="annotation"
                className="bp3-popover-dismiss"
                onClick={()=>this.addText()}></Button>

                <Button icon="function"
                className="bp3-popover-dismiss"
                onClick={()=>this.addScript()}></Button>

                <Button icon="folder-open"
                className="bp3-popover-dismiss"
                onClick={()=>this.addFile()}></Button>

                <Button icon="media"
                className="bp3-popover-dismiss"
                onClick={()=>this.addImage()}></Button>

                <Button icon="link"
                className="bp3-popover-dismiss"
                onClick={()=>this.addLink()}></Button>

                <Divider />

                <Button active={this.state.defaultActive}
                onClick={()=>this.defaultToggle()}>Default</Button>

            </ButtonGroup>
            </div>
        )
    }

    elementSpacerClass() {
        return this.props.isOver ? "element-spacer expanded" : "element-spacer";
    }

    render() {
        var dropTarget = this.props.dropTarget;

        return dropTarget(
            <div className="element">
                <div className={this.elementSpacerClass()}></div>
                <div className="element-content">

                    <div className="append-button"
                    onClick={ev => this.onClick(ev)}
                    onContextMenu={ev => this.onClick(ev)}
                    onMouseDown={(ev)=>this.onMouseDown(ev)}></div>
                    
                    <Popover content={this.appendMoreMenu()} position={Position.RIGHT}>
                        <div className="append-more-button"
                        onMouseDown={(ev)=>this.onMouseDown(ev)}>
                            <Icon icon="more" />
                        </div>
                    </Popover>

                </div>
            </div>
        );
    }
}

const dropTarget = {
    drop(props, monitor) {
        if(monitor.getDropResult() != null)
            return;
        
        return {
            path: props.path,
            key: null
        };
    }
};

function dropCollect(connect, monitor) {
    return {
        dropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }) 
    }
}

export default DropTarget("element", dropTarget, dropCollect)(AppendButton);

import React, { Component } from 'react';
import NewElement from '../newElement';
import { Button, ButtonGroup, Divider, Popover, Icon, Position, ControlGroup, InputGroup } from '@blueprintjs/core';
import { DropTarget } from 'react-dnd';

class AppendButton extends Component
{
    constructor(props) {
        super(props)

        this.state = {
            defaultActive: false,
            hrefValue: "",
            linkAddOpen: false
        };
    }

    onClick(ev) {
        // Should add whatever the default is
        this.addText();
    }

    addPage() {
        this.append(new NewElement("Page", []));
    }

    addText() {
        this.append(new NewElement("Text", []));
    }

    addScript() {
        this.append(new NewElement("Script", []));
    }

    addFile() {
        var parentId = this.props.path[this.props.path.length - 1];
        this.props.app.kernelSend("addFile", { page: parentId });
    }

    addImage() {
        var parentId = this.props.path[this.props.path.length - 1];
        this.props.app.kernelSend("addImage", { page: parentId });
    }

    addLink() {
        this.setState({
            hrefValue: "",
            linkAddOpen: true
        });
    }

    addLinkComplete() {
        this.append(new NewElement("Link", [this.state.hrefValue]));
    }

    addLinkInputRef(ref) {
        if(ref != null)
            ref.focus();
    }

    addLinkInputChanged(ev) {
        this.setState({
            hrefValue: ev.target.value
        });
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

    elementSpacerClass() {
        return this.props.isOver ? "element-spacer expanded" : "element-spacer";
    }

    popoverContent() {
        if(this.state.linkAddOpen)
            return this.addLinkMenu();
        else
            return this.appendMoreMenu();
    }

    popoverDismissed() {
        this.setState({
            linkAddOpen: false
        });
    }

    addLinkMenu() {
        return(
            <div className="link-add-popover" onMouseDown={ev => this.onMouseDown(ev)}>
                <ControlGroup fill={true} vertical={false}>
                    <InputGroup placeholder="Link address..."
                    inputRef={ref => this.addLinkInputRef(ref)}
                    onChange={ev => this.addLinkInputChanged(ev)}
                    value={this.state.hrefValue} />
                    <Button icon="add"
                    className="bp3-popover-dismiss"
                    onClick={() => this.addLinkComplete()}></Button>
                </ControlGroup>
            </div>
        );
    }

    appendMoreMenu() {
        return(
            <div className="append-more-menu" onMouseDown={ev => this.onMouseDown(ev)}>
                <ButtonGroup minimal={false} onMouseEnter={()=>{}}>
                    
                    <Button icon="align-left"
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
                    onClick={()=>this.addLink()}></Button>

                    <Divider />

                    <Button icon="document"
                    className="bp3-popover-dismiss"
                    onClick={()=>this.addPage()}></Button>

                    <Divider />

                    <Button active={this.state.defaultActive}
                    onClick={()=>this.defaultToggle()}>Default</Button>

                </ButtonGroup>
            </div>
        )
    }

    render() {
        var dropTarget = this.props.dropTarget;

        return dropTarget(
            <div className="element" onMouseDown={ev => this.onMouseDown(ev)}>
                <div className={this.elementSpacerClass()}></div>
                <div className="element-content">

                    <div className="append-button"
                    onClick={ev => this.onClick(ev)}
                    onContextMenu={ev => this.onClick(ev)}
                    onMouseDown={(ev)=>this.onMouseDown(ev)}></div>
                    
                    <Popover
                    content={this.popoverContent()}
                    position={Position.RIGHT}
                    transitionDuration={70}
                    onClosed={() => this.popoverDismissed()}>
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

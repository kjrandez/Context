import React, { Component } from 'react';
import { Text, Image, Page, Script, FileRef, Link } from '../element';
import { DragSource, DropTarget } from 'react-dnd';
import { TextAction, FileAction } from '../../action/index.js';

class Clip extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            type: null,
            value: null
        };

        this.fragment = props.app.store.fragment(props.tag.id);
    }

    componentWillMount() {
        this.fragment.attach(this, (value, type) => this.model(value, type));
    }

    componentWillUnmount() {
        this.fragment.detach(this);
    }

    model(value, type) {
        this.setState({
            type: type,
            value: value
        });
    }

    droppedAt(newPath, beforeKey) {
        // Remove this page entry from the clipboard if newPath is also clipboard
        var clipId = this.props.tag.path[0];
        if(newPath.length === 1 && newPath[0] === clipId) {
            // Abort if inserting before self
            if(beforeKey === this.props.tag.key)
                return;
            var clip = this.props.app.store.fragment(clipId);
            clip.invoke("remove", [this.props.tag.key], true);
        }

        // Get reference to the new parent page
        var newParentId = newPath[newPath.length - 1];
        var newParent = this.props.app.store.fragment(newParentId);

        // Allow selection to be grabbed when element is inserted
        this.props.app.setGrabPath(newPath);

        // Add this element to the new page before the given key or at the end
        if(beforeKey != null)
            newParent.invoke("insertBefore", [this.fragment, beforeKey, true], true);
        else
            newParent.invoke("append", [this.fragment, true], true);
    }

    renderSpecialized() {
        var type = this.state.type;
        var value = this.state.value;
        var tag = this.props.tag;
        var app = this.props.app;

        switch(type) {
            case "Page":
                return <Page
                    value={value} tag={tag}
                    selection={[]} grabFocus={false} action={null}
                    app={app} />;
            case "Text":
                return <Text
                    value={value} tag={tag}
                    selection={[]} grabFocus={false} action={null}
                    app={app} />;
            case "Image":
                return <Image
                    value={value} tag={tag}
                    selection={[]} grabFocus={false} action={null}
                    app={app} />;
            case "Script":
                return <Script
                    value={value} tag={tag}
                    selection={[]} grabFocus={false} action={null}
                    app={app} />;
            case "Link":
                return <Link
                    value={value} tag={tag}
                    selection={[]} grabFocus={false} action={null}
                    app={app} />;
            case "FileRef":
                return <FileRef
                    value={value} tag={tag}
                    selection={[]} grabFocus={false} action={null}
                    app={app} />
            default:
                return <div>
                    <p>{type}</p>
                    <p>Id: {tag.id}</p>
                </div>
        }
    }

    clipboardEntrySpacerClass() {
        if(this.props.isOver)
            return "clipboard-entry-spacer expanded";
        else
            return "clipboard-entry-spacer";
    }

    render() {
        if(this.state.value == null)
            return null;

        var dragSource = this.props.dragSource;
        var dragPreview = this.props.dragPreview;
        var dropTarget = this.props.dropTarget;

        return dropTarget(
            <div className="clipboard-entry">
                
                <div className={this.clipboardEntrySpacerClass()}></div>
                {dragSource(dragPreview(<div className="clipboard-entry-content">
                    <div className="clipboard-entry-content-preview">
                        {this.renderSpecialized()}
                    </div>
                </div>))}
            </div>
        );
    }
}

const dragSource = {
    beginDrag(props) {
        return {};
    },

    endDrag(props, monitor, component) {
        var result = monitor.getDropResult();
        if(result == null)
            return;
        
        component.droppedAt(result.path, result.key);
    }
};

function dragCollect(connect, monitor) {
    return {
        dragSource: connect.dragSource(),
        dragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    };
}

const dropTarget = {
    drop(props, monitor) {
        if(monitor.getDropResult() != null)
            return;

        return { 
            path: props.tag.path,
            key: props.tag.key
        };
    }
};

function dropCollect(connect, monitor) {
    return {
        dropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }) 
    }
}

Clip = DragSource("element", dragSource, dragCollect)(Clip);
Clip = DropTarget("element", dropTarget, dropCollect)(Clip);

export default Clip;
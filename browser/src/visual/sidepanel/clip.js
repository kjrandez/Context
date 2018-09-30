import React, { Component } from 'react';
import { Text, Image, Page, Script } from '../element';
import { DragSource, DropTarget } from 'react-dnd';
import { Tooltip } from '@blueprintjs/core';

class Clip extends Component
{
    droppedAt(newPath, beforeKey) {
        // Remove this page entry from the clipboard if newPath is also clipboard
        var clipId = this.props.loc.path[0];
        if(newPath.length === 1 && newPath[0] === clipId) {
            // Abort if inserting before self
            if(beforeKey === this.props.loc.key)
                return;
            var clip = this.props.app.store.fragment(clipId);
            clip.invoke("remove", [this.props.loc.key]);
        }

        // Get reference to the new parent page
        var newParentId = newPath[newPath.length - 1];
        var newParent = this.props.app.store.fragment(newParentId);

        // Allow selection to be grabbed when element is inserted
        this.props.app.setGrabPath(newPath);

        // Add this element to the new page before the given key or at the end
        if(beforeKey != null)
            newParent.invoke("insertBefore", [this.props.fragment, beforeKey, true]);
        else
            newParent.invoke("append", [this.props.fragment, true]);
        
        // Keep this element invisible while background operations are occurring
        this.setState({ hide: true });
    }

    renderSpecialized() {
        switch(this.props.fragment.type()) {
            case "Text":
                return <Text fragment={this.props.fragment}
                loc={{path: [], key: 0}}
                selection={[]}
                grabFocus={false}
                app={this.props.app} />;
            case "Image":
                return <Image fragment={this.props.fragment}
                loc={{path: [], key: 0}}
                selection={[]}
                grabFocus={false}
                app={this.props.app} />;
            case "Page":
                return <Page fragment={this.props.fragment}
                loc={{path: [], key: 0}}
                selection={[]}
                grabFocus={false}
                app={this.props.app} />;
            case "Script":
                return <Script fragment={this.props.fragment}
                loc={{path: [], key: 0}}
                selection={[]}
                grabFocus={false}
                app={this.props.app} />;
            default:
                return <div>
                    <p>{this.props.fragment.type()}</p>
                    <p>Id: {this.props.fragment.id()}</p>
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
            path: props.loc.path,
            key: props.loc.key
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
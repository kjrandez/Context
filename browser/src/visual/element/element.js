import React, {Component} from 'react';
import Selection from '../../selection.js';
import { Page, Image, Text, Script } from '.';
import { DragSource, DropTarget } from 'react-dnd';

class Element extends Component 
{
    constructor(props) {
        super(props);

        this.refNode = { current: null };
        this.uniqueSelection = new Selection(
            props.loc, props.fragment, this.refNode
        );

        this.grabFocus = false;
        if(this.props.loc.latest) {
            var grabPath = this.props.app.getGrabPath();
            if(grabPath != null) {
                var samePath = this.props.loc.path.every((item, index) => item === grabPath[index])
                if(samePath) {
                    this.props.app.grabSelection(this.uniqueSelection);
                    this.grabFocus = true;
                }
            }
        }

        this.state = { hide: false }
    }

    setRefNode(node) {
        this.refNode.current = node;
    }

    droppedAt(newPath, beforeKey) {
        console.log("Drag complete");
        console.log(newPath);
        console.log(beforeKey);

        // Remove this page entry from the parent
        var myPath = this.props.loc.path;
        var parentId = myPath[myPath.length - 1];
        var parent = this.props.app.store.fragment(parentId);
        parent.invoke("remove", [this.props.loc.key]);

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

    onMouseDown(event) {
        event.stopPropagation();
        this.props.app.selected(this.uniqueSelection, event.ctrlKey);
    }

    componentWillUnmount() {
        this.props.app.deselected(this.uniqueSelection);
    }

    isSelected() {
        return this.props.selection.indexOf(this.uniqueSelection) >= 0;
    }

    elementClass() {
        return (this.props.isDragging || this.state.hide) ? "element dragging" : "element";
    }

    elementContentClass() {
        return this.isSelected() ? "element-content selected" : "element-content";
    }

    elementHandleClass() {
        return this.isSelected() ? "element-handle selected" : "element-handle";
    }

    elementSpacerClass() {
        return this.props.isOver ? "element-spacer expanded" : "element-spacer";
    }

    specializedElement() {
        var fragment = this.props.fragment;
        var loc = this.props.loc;
        var selection = this.props.selection;
        var app = this.props.app;
        var grabFocus = this.grabFocus;

        switch(fragment.type()) {
            case "Page":
                return <Page
                    fragment={fragment}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "Text":
                return <Text
                    fragment={fragment}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "Image":
                return <Image
                    fragment={fragment}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "Script":
                return <Script
                    fragment={fragment}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            default:
                return <p>Undefined element: {fragment.type()}</p>;
        }
    }

    render() {
        var dropTarget = this.props.dropTarget;
        var dragSource = this.props.dragSource;
        var dragPreview = this.props.dragPreview;

        return dropTarget(dragPreview(
            <div className={this.elementClass()}
            onMouseDown={(event) => this.onMouseDown(event)}
            ref={node => this.setRefNode(node)}>
                <div className={this.elementSpacerClass()}></div>
                {dragSource(<div className={this.elementHandleClass()}></div>)}
                <div className={this.elementContentClass()}>
                    {this.specializedElement()}
                </div>
            </div>
        ));
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

Element = DragSource("element", dragSource, dragCollect)(Element);
Element = DropTarget("element", dropTarget, dropCollect)(Element);

export default Element;
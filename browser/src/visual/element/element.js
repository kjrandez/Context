import React, {Component} from 'react';
import Selection from '../../selection.js';
import { Page, Image, Text, Script, Link, FileRef } from '.';
import { DragSource, DropTarget } from 'react-dnd';

class Element extends Component 
{
    constructor(props) {
        super(props);

        this.state = {
            hide: false,
            type: null,
            value: null
        }

        this.fragment = props.app.store.fragment(props.tag.id);
        this.uniqueSelection = new Selection(
            props.tag, this.fragment, { current: null }
        );
        this.grabFocus = this.grabSelectionIfLatest();
    }

    componentWillMount() {
        this.fragment.attach(this, (value, type) => this.model(value, type));
    }

    grabSelectionIfLatest() {
        if(this.props.tag.latest) {
            var grabPath = this.props.app.getGrabPath();
            if(grabPath != null) {
                var samePath = this.props.tag.path.every((item, index) => item === grabPath[index])
                if(samePath) {
                    this.props.app.grabSelection(this.uniqueSelection);
                    return true;
                }
            }
        }

        return false;
    }

    model(value, type) {
        this.setState({
            type: type,
            value: value
        });
    }

    setRefNode(node) {
        this.uniqueSelection.ref.current = node;
    }

    droppedAt(newPath, beforeKey) {
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
        this.fragment.detach(this);
        this.props.app.deselected(this.uniqueSelection);
    }

    isSelected() {
        return this.props.selection.indexOf(this.uniqueSelection) >= 0;
    }

    elementClass() {
        var cl = "element";
        if(this.isSelected()) {
            cl += " selected";
        }
        if(this.props.isDragging || this.state.hide) {
            cl += " dragging";
        }
        return cl;
    }

    elementSpacerClass() {
        return this.props.isOver ? "element-spacer expanded" : "element-spacer";
    }

    specializedElement() {
        var type = this.state.type;
        var value = this.state.value;
        var loc = this.props.loc;
        var selection = this.props.selection;
        var app = this.props.app;
        var grabFocus = this.grabFocus;

        switch(type) {
            /*case "Page":
                return <Page
                    value={value}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "Text":
                return <Text
                    value={value}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "Image":
                return <Image
                    value={value}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "Script":
                return <Script
                    value={value}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "Link":
                return <Link
                    value={value}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "FileRef":
                return <FileRef
                    value={value}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />*/
            default:
                return <p>Unknown element. Type: {type}</p>;
        }
    }

    renderHandle(dragSource) {
        var handle = <div className="element-box-handle"></div>;

        if(this.isSelected()) 
            return dragSource(handle);

        return null;
    }

    renderPreload() {
        return <p>Loading...</p>
    }

    render() {
        if(this.state.type == null || this.state.value == null)
            return this.renderPreload();
        
        var dropTarget = this.props.dropTarget;
        var dragSource = this.props.dragSource;
        var dragPreview = this.props.dragPreview;

        return dropTarget(dragPreview(

            <div className={this.elementClass()}
            onMouseDown={(event) => this.onMouseDown(event)}
            ref={node => this.setRefNode(node)}>

                <div className={this.elementSpacerClass()}></div>

                <div className="element-box">

                    {this.renderHandle(dragSource)}

                    <div className="element-box-content">

                        {this.specializedElement()}

                    </div>

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
        
        component.droppedAt(result.path, result.key, result.before);
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
            key: props.loc.key,
            before: true
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
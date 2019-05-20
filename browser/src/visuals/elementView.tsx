import React, { Component, ReactElement } from 'react';

interface ElementProps {
    selected: boolean;
    hide: boolean;
    isDragging: boolean; // Fulfilled by ReactDND
    isOver: boolean; // Fulfilled by ReactDND
    onMouseDown: (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    setRefNode: (_: HTMLDivElement | null) => void;
}

export default class ElementView extends Component<ElementProps>
{
    isSelected() {
        return this.props.selected;
    }

    elementClass() {
        var cl = "element";
        if(this.isSelected()) {
            cl += " selected";
        }
        if(this.props.isDragging || this.props.hide) {
            cl += " dragging";
        }
        return cl;
    }

    elementSpacerClass() {
        return this.props.isOver ? "element-spacer expanded" : "element-spacer";
    }

    renderHandle(dragSource: any) {
        var handle = <div className="element-box-handle"></div>;

        if(this.isSelected()) 
            return dragSource(handle);

        return null;
    }

    render(): ReactElement {
        // Fulfilled by ReactDND
        let dragSource = (X: any) => <>{X}</>
        let dropTarget = (X: any) => <>{X}</>
        let dragPreview = (X: any) => <>{X}</>

        return dropTarget(dragPreview(
            <div className={this.elementClass()}
            onMouseDown={this.props.onMouseDown}
            ref={this.props.setRefNode}>

                <div className={this.elementSpacerClass()}></div>

                <div className="element-box">

                    {this.renderHandle(dragSource)}

                    <div className="element-box-content"> {this.props.children} </div>

                </div>

            </div>
        ));
    }
}

/* Major Original ReactDND Stuff

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

Element = DragSource("element", dragSource, dragCollect)(Element);
Element = DropTarget("element", dropTarget, dropCollect)(Element);

export default Element;

*/
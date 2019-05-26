import React, { Component, ReactElement } from 'react';
import { DragSource, DropTarget, DragSourceConnector, DragSourceMonitor, DropTargetMonitor, DropTargetConnector, ConnectDragSource, ConnectDropTarget, ConnectDragPreview } from 'react-dnd';
import { Presenter } from '../presenter';

interface TileProps {
    selected: boolean;
    hide: boolean;
    onMouseDown: (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    setRefNode: (_: HTMLDivElement | null) => void;
    content: {[_: string]: ReactElement};
    isDragging: boolean;
    isOver: boolean;
    dragSource: ConnectDragSource;
    dropTarget: ConnectDropTarget;
    dragPreview: ConnectDragPreview;
}

class TileView extends Component<TileProps>
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

    renderHandle(dragSource: ConnectDragSource) {
        var handle = <div className="element-box-handle"></div>;

        if(this.isSelected()) 
            return dragSource(handle);

        return null;
    }

    render(): ReactElement | null {
        return this.props.dropTarget(this.props.dragPreview(
            <div className={this.elementClass()}
            onMouseDown={this.props.onMouseDown}
            ref={this.props.setRefNode}>

                <div className={this.elementSpacerClass()}></div>

                <div className="element-box">

                    {this.renderHandle(this.props.dragSource)}

                    <div className="element-box-content"> {this.props.content.specialized} </div>

                </div>

            </div>
        ));
    }

    droppedAt(newPath: Presenter[][], beforeKey: number) {
        alert("Dropped");
    }
}

const dragSource = {
    beginDrag(props: TileProps) {
        return {};
    },

    endDrag(props: TileProps, monitor: DragSourceMonitor, component: TileView) {
        var result = monitor.getDropResult();
        if(result == null)
            return;
        
        component.droppedAt(result.path, result.key);
    }
};

function dragCollect(connect: DragSourceConnector, monitor: DragSourceMonitor) {
    return {
        dragSource: connect.dragSource(),
        dragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    };
}

const dropTarget = {
    drop(props: TileProps, monitor: DropTargetMonitor) {
        if(monitor.getDropResult() != null)
            return;

        return { 
            path: [] as Presenter[][],
            key: 0 as number
        };
    }
};

function dropCollect(connect: DropTargetConnector, monitor: DropTargetMonitor) {
    return {
        dropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }) 
    }
}

let ExportClass = DragSource("element", dragSource, dragCollect)(TileView);
ExportClass = DropTarget("element", dropTarget, dropCollect)(ExportClass);

export default ExportClass;

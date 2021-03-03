import React, { Component } from "react";
import {
    ConnectDragSource,
    ConnectDropTarget,
    DragSource,
    DragSourceCollector,
    DragSourceSpec,
    DropTarget,
    DropTargetCollector,
    DropTargetMonitor,
    DropTargetSpec
} from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { Store } from "../store";

interface DragProps {
    store: Store;
    path: number[];
    children?: any;

    // Injected by react-dnd
    connectDragSource?: ConnectDragSource;
    isDragging?: boolean;
}

interface DropProps {
    store: Store;
    path: number[];
    append: boolean;
    children?: any;

    // Injected by react-dnd
    connectDropTarget?: ConnectDropTarget;
    isOver?: boolean;
    dragSourceType?: string | symbol | null;
}

interface DragDropSpec {
    path: number[];
    type: "node";
}

class DragNode extends Component<DragProps, { dropped: boolean }> {
    constructor(props: DragProps) {
        super(props);
        this.state = { dropped: false };
    }

    onDrop() {
        this.setState({ dropped: true });
    }

    render() {
        const { connectDragSource, isDragging, store, children } = this.props;

        if (connectDragSource === undefined || isDragging === undefined)
            return <></>; // Never Happens

        if (!this.state.dropped) {
            /* Bad - Perform side effect if isDragging is true during render. */
            if (isDragging) {
                store.shellAction.dragging();
            }
            return connectDragSource(<div>{isDragging ? null : children}</div>);
        } else {
            return <></>;
        }
    }
}

const dragNodeSpec: DragSourceSpec<DragProps, DragDropSpec> = {
    beginDrag(props) {
        return {
            type: "node",
            path: props.path
        };
    },

    endDrag(props, monitor, component) {
        if (monitor.didDrop()) {
            // Forces drag source component to stay hidden if drop completed
            component.onDrop();
        }
    }
};

const dragNodeCollect: DragSourceCollector<{}, DragProps> = function (
    connect,
    monitor
) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
};

const DragNodeOut = DragSource("node", dragNodeSpec, dragNodeCollect)(DragNode);
export { DragNodeOut as DragNode };

class DropNode extends Component<DropProps> {
    componentDidUpdate(prevProps: DropProps) {
        if (!prevProps.isOver && this.props.isOver) {
            // You can use this as enter handler
            console.log(this.props.dragSourceType);
        }

        if (prevProps.isOver && !this.props.isOver) {
            // You can use this as leave handler
        }
    }

    render() {
        const { connectDropTarget, isOver, children } = this.props;

        if (connectDropTarget === undefined || isOver === undefined)
            return <></>; // Never Happens

        let dropSpaceClass = "drop-space " + (isOver ? "over" : "out");
        return connectDropTarget(
            <div>
                <div className={dropSpaceClass} />
                {children}
            </div>
        );
    }
}

const dropNodeSpec: DropTargetSpec<DropProps> = {
    canDrop(props: DropProps, monitor: DropTargetMonitor) {
        return true;
    },

    hover(props: DropProps, monitor: DropTargetMonitor) {
        // This is fired very often and lets you perform side effects
        // in response to the hover. You can't handle enter and leave
        // here—if you need them, put monitor.isOver() into collect() so you
        // can use componentDidUpdate() to handle enter/leave.
    },

    drop(props: DropProps, monitor: DropTargetMonitor) {
        if (monitor.didDrop()) return;
        if (monitor.getItemType() != "node") return;

        const item: DragDropSpec = monitor.getItem();
        console.log(item);
        if (props.append) {
            props.store.pageAction.move(item.path, props.path, null);
        } else {
            let dropPagePath = props.path.slice(0, -1);
            let dropBeforeKey = props.path.slice(-1)[0];
            props.store.pageAction.move(item.path, dropPagePath, dropBeforeKey);
        }
    }
};

const dropNodeCollect: DropTargetCollector<{}, DropProps> = function (
    connect: any,
    monitor: DropTargetMonitor
) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }),
        dragSourceType: monitor.getItemType()
    };
};

const DropNodeOut = DropTarget(
    ["node", NativeTypes.FILE],
    dropNodeSpec,
    dropNodeCollect
)(DropNode);
export { DropNodeOut as DropNode };

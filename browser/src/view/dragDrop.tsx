import React, { ReactElement, Component } from "react";
import { useDrag, useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { Store } from "../store";

interface DragProps {
    store: Store;
    path: number[];
    children?: any;
}

interface DropProps extends DragProps {
    store: Store;
    append: boolean;
}

interface DragDropSpec {
    path: number[];
    onDrop: () => void;
    type: "node";
}

export class DragNode extends Component<DragProps, { dropped: boolean }> {
    constructor(props: DragProps) {
        super(props);
        this.state = { dropped: false };
    }

    onDrop() {
        this.setState({ dropped: true });
    }

    render() {
        if (!this.state.dropped)
            return (
                <DragNodeHook onDrop={() => this.onDrop()} {...this.props} />
            );

        return null;
    }
}

interface DragNodeHookProps extends DragProps {
    onDrop: () => void;
}

function DragNodeHook(props: DragNodeHookProps): ReactElement {
    const [{ isDragging }, drag] = useDrag({
        item: {
            type: "node",
            onDrop: props.onDrop,
            path: props.path
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });
    /* Bad - Perform side effect if isDragging is true during render. */
    if (isDragging) {
        props.store.shellAction.dragging();
    }
    return <div ref={drag}>{isDragging ? null : props.children}</div>;
}

export function DropNode(props: DropProps): ReactElement {
    const [{ isOver }, drop] = useDrop({
        accept: ["node", NativeTypes.FILE, NativeTypes.URL, NativeTypes.TEXT],
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true })
        }),
        drop(item: DragDropSpec, monitor) {
            const didDrop = monitor.didDrop();
            if (didDrop) return;

            item.onDrop();

            if (props.append) {
                props.store.pageAction.move(item.path, props.path, null);
            } else {
                let dropPagePath = props.path.slice(0, -1);
                let dropBeforeKey = props.path.slice(-1)[0];
                props.store.pageAction.move(
                    item.path,
                    dropPagePath,
                    dropBeforeKey
                );
            }
        }
    });
    let dropSpaceClass = "drop-space " + (isOver ? "over" : "out");
    return (
        <div ref={drop}>
            <div className={dropSpaceClass} />
            {props.children}
        </div>
    );
}

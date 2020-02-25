import React, { ReactElement } from 'react';
import { useDrag, useDrop } from 'react-dnd'
import { Store } from '../store';

interface DragDropProps {
    store: Store,
    path: number[],
    children?: any
}

export function DragDropNode(props: DragDropProps): ReactElement | null {
    return(
        <DropNode {...props}>
            <DragNode {...props}>
                {props.children}
            </DragNode>
        </DropNode>
    );
}

export function DragNode(props: DragDropProps): ReactElement | null {
    const [{isDragging}, drag] = useDrag({
        item: {path: props.path, type: 'node'},
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        })
    });
    return(
        <div ref={drag}>
            { isDragging ? null : props.children }
        </div>
    );
}

export function DropNode(props: DragDropProps): ReactElement {
    const [{isOver}, drop] = useDrop({
        accept: 'node',
        collect: monitor => ({
            isOver: monitor.isOver({shallow: true})
        })
    });
    let dropSpaceClass = "drop-space " + (isOver ? "over" : "out");
    return(
        <div ref={drop}>
            <div className={dropSpaceClass} />
            {props.children}
        </div>
    );
}

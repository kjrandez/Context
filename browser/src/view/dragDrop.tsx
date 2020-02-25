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
        <DragNode {...props}>
            <DropNode {...props}>
                {props.children}
            </DropNode>
        </DragNode>
    );
}

export function DragNode(props: DragDropProps): ReactElement | null {
    const [{isDragging}, drag] = useDrag({
        item: {path: props.path, type: 'node'},
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        })
    });
    if (!isDragging)
        return <div ref={drag}>{props.children}</div>
    return null;
}

export function DropNode(props: DragDropProps): ReactElement {
    const [{isOver}, drop] = useDrop({
        accept: 'node',
        collect: monitor => ({
            isOver: monitor.isOver({shallow: true}),
            canDrop: monitor.canDrop(),
        })
    });
    let dropSpaceClass = "drop-space " + (isOver ? "over" : "out");
    return(
        <div 
            ref={drop}
            draggable
            onDragStart={(ev) => {ev.stopPropagation(); ev.preventDefault()}}>
            <div className={dropSpaceClass} />
            {props.children}
        </div>
    );
}

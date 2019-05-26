import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';

class AppendArea extends Component
{
    appendAreaClass() {
        return this.props.isOver ? "clipboard-append-area expanded" : "clipboard-append-area";
    }

    render() {
        var dropTarget = this.props.dropTarget;

        return dropTarget(
            <div className={this.appendAreaClass()}>
            </div>
        );
    }
}

const dropTarget = {
    drop(props, monitor) {
        if(monitor.getDropResult() != null)
            return;
        
        return {
            path: props.path,
            key: null
        };
    }
};

function dropCollect(connect, monitor) {
    return {
        dropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }) 
    }
}

export default DropTarget("element", dropTarget, dropCollect)(AppendArea);

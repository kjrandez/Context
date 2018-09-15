import React, {Component} from 'react';

export default class Element extends Component 
{
    onMouseDown(event) {
        event.stopPropagation();
        this.props.app.selected(this.props.fragment, event.ctrlKey);
    }

    className() {
        if(this.props.selection.indexOf(this.props.fragment) >= 0)
            return "element selected-element";
        else
            return "element";
    }

    render() {
        return (
            <div
                className={this.className()}
                onMouseDown={(event) => this.onMouseDown(event)}>
                {this.props.children}
            </div>
        )
    }
}

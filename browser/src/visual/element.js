import React, {Component} from 'react';
import Selection from '../selection.js';

export default class Element extends Component 
{
    constructor(props) {
        super(props);
        this.uniqueSelection = new Selection(props.path, props.index, props.fragment);
    }

    onMouseDown(event) {
        event.stopPropagation();
        this.props.app.selected(this.uniqueSelection, event.ctrlKey);
    }

    isSelected() {
        return this.props.selection.indexOf(this.uniqueSelection) >= 0;
    }

    className() {
        if(this.isSelected())
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

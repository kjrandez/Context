import React, {Component} from 'react';
import Selection from '../../selection.js';

export default class Element extends Component 
{
    constructor(props) {
        super(props);
        this.uniqueSelection = new Selection(
            props.loc, props.fragment, React.createRef()
        );
    }

    onMouseDown(event) {
        event.stopPropagation();
        this.props.app.selected(this.uniqueSelection, event.ctrlKey);
    }

    componentWillUnmount() {
        this.props.app.deselected(this.uniqueSelection);
    }

    isSelected() {
        return this.props.selection.indexOf(this.uniqueSelection) >= 0;
    }

    elementContentClass() {
        return this.isSelected() ? "element-content selected" : "element-content";
    }

    elementHandleClass() {
        return this.isSelected() ? "element-handle selected" : "element-handle";
    }

    render() {
        return (
            <div
                className="element"
                onMouseDown={(event) => this.onMouseDown(event)}
                ref={this.uniqueSelection.ref}>
                <div className="element-spacer"></div>
                <div className={this.elementHandleClass()}></div>
                <div className={this.elementContentClass()}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

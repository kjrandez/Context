import React, { Component } from 'react';
import { NewElement } from '../store';

export default class AppendButton extends Component
{
    onClick() {
        var path = this.props.path;
        var fragment = this.props.app.store.fragment(path[path.length - 1])

        // Append newly-created element, and note which entry it is.
        fragment.invoke("append", [
            new NewElement("Text", ["Insert text..."]),
            true
        ])

        // The app will store this path
        this.props.app.setGrabPath(this.props.path);
    }

    onMouseDown(event) {
        event.stopPropagation();
    }

    render() {
        return(
            <div className="element">
                <div className="element-spacer"></div>
                <button className="append-button"
                onClick={()=>this.onClick()}
                onMouseDown={(ev)=>this.onMouseDown(ev)}>
                </button>
            </div>
        );
    }
}

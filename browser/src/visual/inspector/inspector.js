import React, {Component} from 'react';
import ScriptInspector from './scriptInspector';

export default class Inspector extends Component
{
    className() {
        if(this.props.selection.length === 1)
            return "inspector-visible";
        else
            return "inspector-hidden";
    }

    inspectorContent() {
        if(this.props.selection.length !== 1)
            return null;
        
        var selection = this.props.selection[0];
        var fragment = selection.fragment;

        switch(fragment.type()) {
            case "Script":
                return <ScriptInspector
                    path={selection.path}
                    fragment={fragment}
                    app={this.props.app}/>
            default:
                return null;
        }
    }

    onMouseDown(event) {
        event.stopPropagation();
    }

    render() {
        return(
            <div
                id="inspector"
                className={this.className()}
                onMouseDown={(ev) => this.onMouseDown(ev)}>
                <div className="inspector-content">
                    {this.inspectorContent()}
                </div>
            </div>
        )
    }
}
import React, {Component} from 'react';

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
        var value = this.props.app.store.value(fragment.key());

        return (
            <span>
                <b>Key:</b> {fragment.key()}<br />
                <b>Type:</b> {fragment.type()}<br />
                <br/>
                {JSON.stringify(value)}
            </span>
        )
    }

    render() {
        return(
            <div id="inspector" className={this.className()}>
                <div className="inspector-content">
                    {this.inspectorContent()}
                </div>
            </div>
        )
    }
}
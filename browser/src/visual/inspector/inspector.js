import React, {Component} from 'react';
import { GenericInspector, ScriptInspector, PageInspector } from '.';

export default class Inspector extends Component
{
    constructor(props) {
        super(props);
        this.contentRef = React.createRef();
    }

    componentDidUpdate() {
        if(this.contentRef.current != null) {
            var rect = this.contentRef.current.getBoundingClientRect();
            if(rect.top < 10) {
                this.contentRef.current.style.marginTop = "10px";
            }
            else if(rect.bottom > (window.innerHeight - 10)) {
                var newTop = window.innerHeight - rect.height - 10;
                this.contentRef.current.style.marginTop = newTop + "px";
            }
        }
    }

    currentSelection() {
        if(this.props.selection.length !== 1)
            return null;
        return this.props.selection[0];
    }

    className(selection) {
        if(selection != null)
            return "inspector-visible";
        else
            return "inspector-hidden";
    }

    inspectorContent(selection) {
        return (
            <div ref={this.contentRef}
            className="inspector-content"
            style={{marginTop: this.inspectorLoc(selection)}}>
                {this.inspectorContentInner(selection)}
            </div>
        );
    }

    inspectorContentInner(selection) {    
        if(selection == null)
            return null;
        
        var fragment = selection.fragment;

        switch(fragment.type()) {
            case "Page":
                return <PageInspector  
                    fragment={fragment}
                    loc={selection.loc}
                    app={this.props.app} />
            case "Script":
                return <ScriptInspector
                    fragment={fragment}
                    loc={selection.loc}
                    app={this.props.app} />
            default:
                return <GenericInspector
                    fragment={fragment}
                    loc={selection.loc}
                    app={this.props.app} />
        }
    }

    inspectorLoc(selection) {
        if(selection == null)
            return 10;
        return selection.ref.current.getBoundingClientRect().top;
    }

    onMouseDown(event) {
        event.stopPropagation();
    }

    render() {
        var selection = this.currentSelection();

        return(
            <div id="inspector"
            className={this.className(selection)}
            onMouseDown={(ev) => this.onMouseDown(ev)}>
                {this.inspectorContent(selection)}
            </div>
        )
    }
}
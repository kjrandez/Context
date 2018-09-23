import React, {Component} from 'react';
import Selection from '../../selection.js';
import { Page, Image, Text, Script } from '.';

export default class Element extends Component 
{
    constructor(props) {
        super(props);

        this.uniqueSelection = new Selection(
            props.loc, props.fragment, React.createRef()
        );

        this.grabFocus = false;
        if(this.props.loc.latest) {
            var grabPath = this.props.app.getGrabPath();
            if(grabPath != null) {
                var samePath = this.props.loc.path.every((item, index) => item === grabPath[index])
                if(samePath) {
                    this.props.app.selected(this.uniqueSelection, false);
                    this.grabFocus = true;
                }
            }
        }
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

    specializedElement() {
        var fragment = this.props.fragment;
        var loc = this.props.loc;
        var selection = this.props.selection;
        var app = this.props.app;
        var grabFocus = this.grabFocus;

        switch(fragment.type()) {
            case "Page":
                return <Page
                    fragment={fragment}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "Text":
                return <Text
                    fragment={fragment}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "Image":
                return <Image
                    fragment={fragment}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            case "Script":
                return <Script
                    fragment={fragment}
                    loc={loc}
                    selection={selection}
                    grabFocus={grabFocus}
                    app={app} />;
            default:
                return <p>Undefined element: {fragment.type()}</p>;
        }
    }

    render() {
        return (
            <div className="element"
            onMouseDown={(event) => this.onMouseDown(event)}
            ref={this.uniqueSelection.ref}>
                <div className="element-spacer"></div>
                <div className={this.elementHandleClass()}></div>
                <div className={this.elementContentClass()}>
                    {this.specializedElement()}
                </div>
            </div>
        )
    }
}

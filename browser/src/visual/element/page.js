import React, {Component} from 'react';
import Element from './element.js';
import {elementList} from '../shared.js';
import { Collapse } from "@blueprintjs/core";

export default class Page extends Component
{
    constructor(props) {
        super(props);

        var value = this.props.fragment.value();

        this.state = {
            content: value.content.map(entry => {
                return {
                    key: entry.key,
                    fragment: this.props.app.store.fragment(entry.element)
                }
            }),
            isOpen: false
        }
    }

    modelChanged() {
        var value = this.props.fragment.value();

        this.setState({
            content: value.content.map(entry => {
                return {
                    key: entry.key,
                    fragment: this.props.app.store.fragment(entry.element)
                }
            })
        });
    }

    isRecursivePage() {
        return this.props.loc.path.indexOf(this.props.fragment.id()) >= 0;
    }

    firstTextEntry() {
        if(this.state.content.length < 2)
            return null;
        
        var firstEntry = this.state.content[0];
        if(firstEntry.fragment.type() !== "Text")
            return null;
        
        return firstEntry;
    }

    headerContent(headerElement) {
        if(headerElement == null)
            if(this.state.isOpen)
                return null;
            else
                return <div className="page-header-rule"></div>

        return elementList(
            [headerElement],
            this.props.loc.path.concat(this.props.fragment.id()),
            this.props.selection,
            this.props.app
        )
    }

    revealContent(headerElement) {
        var pageContent;
        if(headerElement == null)
            pageContent = this.state.content;
        else
            pageContent = this.state.content.slice(1);
        
        if(!this.isRecursivePage()) {
            return elementList(
                pageContent, 
                this.props.loc.path.concat(this.props.fragment.id()),
                this.props.selection,
                this.props.app
            )
        } else {
            return <p>Recursive page {this.props.fragment.id()}</p>
        }
    }

    onMouseDown(event) {
        event.stopPropagation();
    }

    onClick(event) {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    expandButtonClass() {
        var className = "bp3-button bp3-minimal bp3-small ";

        if(this.state.isOpen)
            className += "bp3-icon-caret-down";
        else
            className += "bp3-icon-caret-right";

        return className;
    }

    render() {
        var headerElement = this.firstTextEntry();

        return (
            <Element
                fragment={this.props.fragment}
                loc={this.props.loc}
                selection={this.props.selection}
                app={this.props.app}>
                    <div className="page">
                        <div className="page-sidebar">
                            <div className="page-sidebar-button">
                                <button
                                    type="button"
                                    className={this.expandButtonClass()}
                                    onMouseDown={(event) => this.onMouseDown(event)}
                                    onClick={(event) => this.onClick(event)}>
                                </button>
                            </div>
                            <div className="page-sidebar-line"></div>
                        </div>
                        <div className="page-body">
                            <div>
                                {this.headerContent(headerElement)}
                            </div>
                            <Collapse isOpen={this.state.isOpen}>
                                {this.revealContent(headerElement)}
                            </Collapse>
                        </div>
                    </div>
            </Element>
        );
    }

    componentWillMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect(this);
    }
}

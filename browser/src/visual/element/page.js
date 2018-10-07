import React, {Component} from 'react';
import {elementList} from '../shared.js';
import { Collapse } from "@blueprintjs/core";
import PageHeader from './pageHeader';

export default class Page extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        }
    }

    contentFromValue(value) {
        var latestEntryKey = (value.latestEntry == null) ? null : value.latestEntry.key;

        return value.content.map(pageEntry => {
            return {
                id: pageEntry.element,
                key: pageEntry.key,
                latest: pageEntry.key === latestEntryKey
            }
        });
    }

    modelChanged() {
        var value = this.props.fragment.value();
        var latestEntryKey = (value.latestEntry == null) ? null : value.latestEntry.key;

        this.setState({
            content: value.content.map(entry => {
                return {
                    key: entry.key,
                    fragment: this.props.app.store.fragment(entry.element),
                    latest: entry.key === latestEntryKey
                }
            })
        });
    }

    isRecursivePage() {
        return this.props.tag.path.indexOf(this.props.tag.id) >= 0;
    }

    firstElementIsHeader() {
        return false;
    }

    revealContent() {
        if(!this.isRecursivePage()) {
            var pageElements = elementList(
                this.contentFromValue(this.props.value), 
                this.props.tag.path.concat(this.props.tag.id),
                this.props.selection,
                this.props.app,
                true
            );

            // Boldify first element, if it's the header
            if(this.firstElementIsHeader()) {
                pageElements[0] = (
                    <span style={{fontWeight: "bold"}}>
                        {pageElements[0]}
                    </span>
                );
            }

            return pageElements;
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
        return (
            <div className="page">
                <div className="page-sidebar">
                    <div className="page-sidebar-button">
                        <button
                        type="button"
                        className={this.expandButtonClass()}
                        onMouseDown={(event) => this.onMouseDown(event)}
                        onClick={(event) => this.onClick(event)}></button>
                    </div>
                    <div className="page-sidebar-line"></div>
                </div>
                <div className="page-body">
                    <Collapse isOpen={!this.state.isOpen}>
                        <PageHeader tag={this.props.tag}
                        value={this.props.value}
                        app={this.props.app} />
                    </Collapse>
                    <Collapse isOpen={this.state.isOpen}>
                        <div className="page-body-content">
                            {this.revealContent()}
                        </div>
                    </Collapse>
                </div>
            </div>
        );
    }
}

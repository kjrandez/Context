import React, { Component } from 'react';
import { Tab, Tabs } from "@blueprintjs/core";
import { Pasteboard, History } from '.';

export default class SidePanel extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            selectedTab: "pasteboard"
        }
    }

    sidepanelOuterClass() {
        if(this.state.isOpen)
            return "sidepanel-outer-visible";
        return "sidepanel-outer-hidden";
    }

    sidepanelInnerClass() {
        if(this.state.isOpen)
            return "sidepanel-inner-visible";
        return "sidepanel-inner-hidden";
    }

    sidepanelButtonClass() {
        if(this.state.isOpen)
            return "sidepanel-button-visible";
        return "sidepanel-button-hidden";
    }

    expandButtonClass() {
        var className = "bp3-button bp3-minimal bp3-small ";

        if(this.state.isOpen)
            className += "bp3-icon-chevron-left";
        else
            className += "bp3-icon-chevron-right";

        return className;
    }

    onClick(event) {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    onMouseDown(event) {
        event.stopPropagation();
    }

    onChange(newTab) {
        this.setState({
            selectedTab: newTab
        });
    }

    tabContent() {
        if(this.state.selectedTab === "pasteboard")
            return <Pasteboard />
        else
            return <History />
    }

    render() {
        return (
            <div id="sidepanel-outer" className={this.sidepanelOuterClass()}>
                <div id="sidepanel-inner" className={this.sidepanelInnerClass()}>
                    <div id="sidepanel-content">
                        <div className="sidepanel-tab-buttons">
                            <Tabs id="TabsExample"
                            onChange={newTab => this.onChange(newTab)}
                            selectedTabId={this.state.selectedTab}>
                                <Tab id="pasteboard" title="Pasteboard" />
                                <Tab id="history" title="History" />
                            </Tabs>
                        </div>
                        {this.tabContent()}
                    </div>
                </div>
                <div id="sidepanel-button" className={this.sidepanelButtonClass()}>
                    <button
                        type="button"
                        className={this.expandButtonClass()}
                        onMouseDown={(event) => this.onMouseDown(event)}
                        onClick={(event) => this.onClick(event)}>
                    </button>
                </div>
            </div>
        );
    }
}

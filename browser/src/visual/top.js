import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { elementList } from './shared.js';
import { Inspector } from './inspector';
import { SidePanel } from './sidepanel';
import PageHeader from './pageHeader.js';

class Top extends Component {
    constructor(props) {
        super(props);

        this.state = {
            topFragment: null,
            content: [],
            selection: [],
            pathIds: [],
            pathFragments: []
        }

        this.topFragment = null;
    }

    componentDidMount() {
        this.props.app.startup(this);
    }

    onMouseDown(event) {
        this.props.app.selected(null, false);
    }

    setTopLevel(newTopFragment, newClipboardFragment, pathIds) {
        // Update fragment connection
        if(this.state.topFragment != null)
            this.state.topFragment.disconnect(this);
        
        // Race condition: Shouldn't do this until the state has
        // actually changed...
        newTopFragment.connect(this)

        // If on a sub-page, remove root and add current to the breadcrumbs
        var breadcrumbIds = pathIds.slice()
        breadcrumbIds.push(newTopFragment.id());
        var pathFragments = breadcrumbIds.map(id => this.props.app.store.fragment(id));

        this.setState({
            topFragment: newTopFragment,
            clipboardFragment: newClipboardFragment,
            content: this.contentFromFragment(newTopFragment),
            pathIds: pathIds,
            pathFragments: pathFragments
        });
    }

    modelChanged() {
        this.setState({
            content: this.contentFromFragment(this.state.topFragment)
        });
    }

    contentFromFragment(fragment) {
        var value = fragment.value();
        var latestEntryKey = (value.latestEntry == null) ? null : value.latestEntry.key;

        return value.content.map(pageEntry => {
            return {
                key: pageEntry.key,
                fragment: this.props.app.store.fragment(pageEntry.element),
                latest: pageEntry.key === latestEntryKey
            }
        });
    }

    setSelection(selection) {
        this.setState({
            selection: selection
        });
    }

    sidepanelContent() {
        if(this.state.clipboardFragment != null)
            return <SidePanel clip={this.state.clipboardFragment} app={this.props.app} />
        else 
            return <span />
    }

    inspectorContent() {
        if(this.state.clipboardFragment != null)
            return <Inspector clip={this.state.clipboardFragment} selection={this.state.selection} app={this.props.app} />
        else
            return <span />
    }

    pageHeader() {
        if(this.state.topFragment != null && this.state.pathFragments != null) {
            return <PageHeader key="breadcrumb"
            pathFragments={this.state.pathFragments} app={this.props.app} />
        }
        return null;
    }

    pageContent() {
        if(this.state.topFragment != null && this.state.pathFragments != null) {
            return(elementList(
                    this.state.content,
                    this.state.pathIds.concat([this.state.topFragment.id()]),
                    this.state.selection,
                    this.props.app, 
                    true
            ));
        } else {
            return <p>Loading...</p>
        }
    }
 
    render() {
        return (
            <div
                id="scene"
                onMouseDown={(event) => this.onMouseDown(event)}>
                <div id="left-column">
                    {this.sidepanelContent()}
                </div>
                <div id="center-column">
                    <div id="page">
                        <div id="top-spacer"></div>
                        {this.pageHeader()}
                        <div id="page-elements">
                            {this.pageContent()}
                        </div>
                        <div id="bottom-spacer"></div>
                    </div>
                </div>
                <div id="right-column">
                    {this.inspectorContent()}
                </div>
            </div>
        );
    }
}  

export default DragDropContext(HTML5Backend)(Top);

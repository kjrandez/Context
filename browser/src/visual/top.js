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

    setTopLevel(fragment, pathIds) {
        // Update fragment connection
        if(this.state.topFragment != null)
            this.state.topFragment.disconnect(this);
        
        // Race condition: Shouldn't do this until the state has
        // actually changed...
        fragment.connect(this)

        // If on a sub-page, remove root and add current to the breadcrumbs
        var breadcrumbIds = pathIds.slice()
        breadcrumbIds.push(fragment.id());
        var pathFragments = breadcrumbIds.map(id => this.props.app.store.fragment(id));

        this.setState({
            topFragment: fragment,
            content: this.contentFromFragment(fragment),
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

    pageContent() {
        if(this.state.topFragment != null && this.state.pathFragments != null) {
            return([

                <PageHeader key="breadcrumb"
                pathFragments={this.state.pathFragments} app={this.props.app} />,

                elementList(
                    this.state.content,
                    this.state.pathIds.concat([this.state.topFragment.id()]),
                    this.state.selection,
                    this.props.app, 
                    true
                )]
            );
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
                    <SidePanel />
                </div>
                <div id="center-column">
                    <div id="page">
                        <div id="top-spacer"></div>
                            {this.pageContent()}
                        <div id="bottom-spacer"></div>
                    </div>
                </div>
                <div id="right-column">
                    <Inspector app={this.props.app} selection={this.state.selection} />
                </div>
            </div>
        );
    }
}  

export default DragDropContext(HTML5Backend)(Top);

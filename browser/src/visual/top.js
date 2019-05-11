import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { elementList } from './shared.js';
import { Toolbar } from './toolbar';
import { SidePanel } from './sidepanel';
import Header from './header.js';

class Top extends Component {
    /*constructor(props) {
        super(props);

        this.state = {
            topFragment: null,
            clipboardFragment: null,
            pathIds: null,
            pathContent: null,
            selection: [],
            selContent: null,
            content: null
        }

        this.topFragment = null;
    }

    componentDidMount() {
        this.props.app.startup(this);
    }

    onMouseDown(event) {
        this.props.app.deselectedAll();
    }

    setPage(newTopFragment, newClipboardFragment, pathIds) {
        // Update fragment connection
        if(this.state.topFragment != null)
            this.state.topFragment.detach(this);

        // Set state to initial prior to content load
        this.setState({
            topFragment: newTopFragment,
            clipboardFragment: newClipboardFragment,
            pathIds: pathIds,
            content: []
        });

        // Connect data model to value handlers
        newTopFragment.attach(this, value => this.modelValue(value));
    }

    modelValue(newValue) {
        // Stop here for now
        this.setState({
            content: this.contentFromValue(newValue)
        })
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

    setSelection(selection) {
        this.setState({
            selection: selection
        });
    }

    setSelectionContent(selectionContent) {
        this.setState({
            selContent: selectionContent
        });
    }

    setPathContent(pathContent) {
        this.setState({
            pathContent: pathContent
        });
    }

    sidepanelContent() {
        if(this.state.clipboardFragment != null)
            return <SidePanel clip={this.state.clipboardFragment} app={this.props.app} />
        else 
            return <span />
    
    }

    toolbarContent() {
        if(this.state.clipboardFragment != null)
            return (
                <Toolbar
                clip={this.state.clipboardFragment}
                selContent={this.state.selContent}
                app={this.props.app} />
            );
        else
            return <span />
    }

    pageHeader() {
        if(this.state.pathContent != null) {
            return <Header key="breadcrumb"
            pathContent={this.state.pathContent}
            app={this.props.app} />
        }
        return null;
    }

    pageContent() {
        if(this.state.topFragment != null) {
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
                    {this.toolbarContent()}
                </div>
            </div>
        );
    }*/
}  

export default DragDropContext(HTML5Backend)(Top);

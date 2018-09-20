import React, {Component} from 'react';
import {elementList} from './shared.js';
import Inspector from './inspector.js';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            content: [],
            selection: []
        }

        this.topFragment = null;
    }

    componentDidMount() {
        this.props.app.startup(this);
    }

    onMouseDown(event) {
        this.props.app.deselected();
    }

    setTopLevel(fragment) {
        // Update fragment connection
        if(this.topFragment != null)
            this.topFragment.disconnect()
        this.topFragment = fragment;
        this.topFragment.connect(this)

        this.modelChanged();
    }

    modelChanged() {
        var value = this.topFragment.value();

        this.setState({
            content: value.content.map((entryKey) => {
                return this.props.app.store.fragment(entryKey);
            })
        });
    }

    setSelection(fragments) {
        // The top-level's state includes the selected page contents
        this.setState({
            selection: fragments
        });
    }

    render() {
        return (
            <div
                id="scene"
                onMouseDown={(event) => this.onMouseDown(event)}>
                <Inspector app={this.props.app} selection={this.state.selection} />
                <div id="page">
                    <div id="top-spacer"></div>
                    {elementList(this.state.content, this.state.selection, this.props.app)}
                    <div id="bottom-spacer"></div>
                </div>
            </div>
        );
    }
}  

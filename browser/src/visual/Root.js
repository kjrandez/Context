import React, {Component} from 'react';
import {elementList} from './shared.js';
import Inspector from './Inspector';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            contents: [],
            selection: []
        }
    }

    componentDidMount() {
        this.props.app.startup(this);
    }

    onMouseDown(event) {
        this.props.app.deselected();
    }

    setModel(fragments) {
        // The top-level's state includes the page contents
        this.setState({
            contents: fragments
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
                    {elementList(this.state.contents, this.state.selection, this.props.app)}
                    <div id="bottom-spacer"></div>
                </div>
            </div>
        );
    }
}  

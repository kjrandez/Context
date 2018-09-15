import React, {Component} from 'react';
import {elementList} from './shared.js';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            contents: []
        }
    }

    componentDidMount() {
        this.props.startup(this);
    }

    setModel(fragments) {
        // The top-level's state includes the page contents
        this.setState({
            contents: fragments
        });
    }

    render() {
        return (
            <div id="page">
                <div id="top-spacer"></div>
                {elementList(this.state.contents)}
                <div id="bottom-spacer"></div>
            </div>
        );
    }
}  

import React, {Component} from 'react';
import Element from './Element.js';
import {elementList} from './shared.js';

export default class Page extends Component
{
    constructor(props) {
        super(props);

        var value = this.props.fragment.value();

        this.state = {
            content: value.content.map((entry) => {
                return this.props.app.store.fragment(entry.key);
            })
        }
    }

    modelChanged() {
        var value = this.props.fragment.value();

        this.setState({
            content: value.content.map((entry) => {
                return this.props.app.store.fragment(entry.key);
            })
        });
    }

    render() {
        return (
            <Element
                fragment={this.props.fragment}
                selection={this.props.selection}
                app={this.props.app}>
                {elementList(this.state.content, this.props.selection, this.props.app)}
            </Element>
        );
    }

    componentDidMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect();
    }
}

import React, {Component} from 'react';
import Element from './element.js';
import {elementList} from './shared.js';

export default class Page extends Component
{
    constructor(props) {
        super(props);

        var value = this.props.fragment.value();

        this.state = {
            content: value.content.map((entryKey) => {
                return this.props.app.store.fragment(entryKey);
            })
        }
    }

    modelChanged() {
        var value = this.props.fragment.value();

        this.setState({
            content: value.content.map((entryKey) => {
                return this.props.app.store.fragment(entryKey);
            })
        });
    }

    isRecursivePage() {
        return this.props.path.indexOf(this.props.fragment.key()) >= 0;
    }

    pageContent() {
        if(!this.isRecursivePage()) {
            return elementList(
                this.state.content, 
                this.props.path.concat(this.props.fragment.key()),
                this.props.selection,
                this.props.app
            )
        } else {
            return <p>Recursive page {this.props.fragment.key()}</p>
        }
    }

    render() {
        return (
            <Element
                path={this.props.path}
                index={this.props.index}
                fragment={this.props.fragment}
                selection={this.props.selection}
                app={this.props.app}>
                    {this.pageContent()}
            </Element>
        );
    }

    componentDidMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect(this);
    }
}

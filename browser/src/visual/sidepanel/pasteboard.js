import React, { Component } from 'react';
import { Text, Image, Page, Script } from '../element';

export default class Pasteboard extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            content: this.contentFromFragment(this.props.paste),
            isOpen: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.props.paste.disconnect(this);
        nextProps.paste.connect(this);
        
        this.setState({
            content: this.contentFromFragment(nextProps.paste)
        });
    }


    modelChanged() {
        this.setState({
            content: this.contentFromFragment(this.props.paste)
        });
    }

    contentFromFragment(fragment) {
        var value = fragment.value();

        var result = value.content.map(entry => {
            return {
                key: entry.key,
                fragment: this.props.app.store.fragment(entry.element)
            }
        });

        result.reverse();
        return result;
    }

    componentWillMount() {
        this.props.paste.connect(this);
    }

    componentWillUnmount() {
        this.props.paste.disconnect(this);
    }

    renderSpecializedEntry(entry) {
        switch(entry.fragment.type()) {
            case "Text":
                return <Text fragment={entry.fragment}
                loc={{path: [], key: 0}}
                selection={[]}
                grabFocus={false}
                app={this.props.app} />;
            case "Image":
                return <Image fragment={entry.fragment}
                loc={{path: [], key: 0}}
                selection={[]}
                grabFocus={false}
                app={this.props.app} />;
            case "Page":
                return <Page fragment={entry.fragment}
                loc={{path: [], key: 0}}
                selection={[]}
                grabFocus={false}
                app={this.props.app} />;
            case "Script":
                return <Script fragment={entry.fragment}
                loc={{path: [], key: 0}}
                selection={[]}
                grabFocus={false}
                app={this.props.app} />;
            default:
                return <div>
                    <p>{entry.fragment.type()}</p>
                    <p>Id: {entry.fragment.id()}</p>
                </div>
        }
    }

    renderEntry(entry) {
        return(
            <div className="pasteboard-entry" key={entry.key}>
                <div className="pasteboard-entry-spacer"></div>
                <div className="pasteboard-entry-content">
                    <div className="pasteboard-entry-content-preview">
                        {this.renderSpecializedEntry(entry)}
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return(
            <div className="sidepanel-tab-content">
                <div className="pasteboard-content">
                    {this.state.content.map(entry => this.renderEntry(entry))}
                </div>
            </div>
        );
    }
}

import React, { Component } from 'react';
import Clip from './clip';
import AppendArea from './appendArea';

export default class Clipboard extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            content: this.contentFromFragment(this.props.clip),
            isOpen: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.props.clip.disconnect(this);
        nextProps.clip.connect(this);
        
        this.setState({
            content: this.contentFromFragment(nextProps.clip)
        });
    }

    modelChanged() {
        this.setState({
            content: this.contentFromFragment(this.props.clip)
        });
    }

    contentFromFragment(fragment) {
        var value = fragment.value();

        return value.content.map(entry => {
            return {
                key: entry.key,
                fragment: this.props.app.store.fragment(entry.element)
            }
        });
    }

    componentWillMount() {
        this.props.clip.connect(this);
    }

    componentWillUnmount() {
        this.props.clip.disconnect(this);
    }

    render() {
        return(
            <div className="sidepanel-tab-content">
                {this.state.content.map(entry => 
                    <Clip key={entry.key}
                    loc={{path: [this.props.clip.id()], key: entry.key}}
                    fragment={entry.fragment}
                    app={this.props.app} />
                )}
                <AppendArea key="append" path={[this.props.clip.id()]} app={this.props.app} />
            </div>
        );
    }
}

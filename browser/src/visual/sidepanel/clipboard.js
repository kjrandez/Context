import React, { Component } from 'react';
import Clip from './clip';
import AppendArea from './appendArea';

export default class Clipboard extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            content: null
        };
    }

    componentWillMount() {
        this.props.fragment.attach(this, value => this.modelValue(value));
    }

    componentWillUnmount() {
        this.props.fragment.detach(this);
    }

    contentFromValue(value) {
        return value.content.map(pageEntry => {
            return {
                id: pageEntry.element,
                key: pageEntry.key
            }
        });
    }

    modelValue(value) {
        console.log("New clipboard value");
        this.setState({
            content: this.contentFromValue(value)
        });
    }

    clipsFromEntries(content) {
        var clipId = this.props.fragment.id();

        return content.map(entry => 
            <Clip key={entry.key}
            tag={{id: entry.id, path: [clipId], key: entry.key}}
            app={this.props.app} />
        )
    }

    tabContent() {
        if(this.state.content != null) {
            return([
                this.clipsFromEntries(this.state.content),

                <AppendArea key="append"
                path={[this.props.fragment.id()]}
                app={this.props.app} />
            ]);
        }

        return <p>Loading...</p>
    }

    render() {
        return(
            <div className = "sidepanel-tab-content">
                {this.tabContent()}
            </div>
        );
    }
}

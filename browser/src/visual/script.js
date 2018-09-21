import React, {Component} from 'react';
import Element from './element.js';

export default class Script extends Component
{
    constructor(props) {
        super(props);

        var value = this.props.fragment.value();

        this.state = {
            content: value.content,
            cbChecked: false
        }
    }

    onClick() {
        var parentKey = this.props.path[this.props.path.length - 1];
        var parent = this.props.app.store.fragment(parentKey)

        this.props.fragment.invoke({
            selector: "execute",
            arguments: [parent, this.state.cbChecked]
        });
    }

    onChange(event) {
        this.props.fragment.invoke({
            selector: "update",
            arguments: [event.target.value]
        });
    }

    cbChange(event) {
        this.setState({
            cbChecked: event.target.checked
        });
    }

    modelChanged() {
        var value = this.props.fragment.value();

        this.setState({
            content: value.content
        });
    }

    render() {
        return (
            <Element
                path={this.props.path}
                index={this.props.index}
                fragment={this.props.fragment}
                selection={this.props.selection}
                app={this.props.app}>
                <div>
                    Script
                    <button type="button" onClick={() => this.onClick()}>Run</button>
                    Run in new thread?
                    <input
                        type="checkbox"
                        checked={this.state.cbChecked}
                        onChange={(ev) => this.cbChange(ev)} />
                </div>
                <textarea
                    onChange={(ev) => this.onChange(ev)}
                    value={this.state.content} />
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

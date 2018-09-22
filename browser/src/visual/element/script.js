import React, {Component} from 'react';
import Textarea from 'react-textarea-autosize';
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

    onChange(event) {
        this.props.fragment.invoke({
            selector: "update",
            arguments: [event.target.value]
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
                <Textarea
                    className="code-edit"
                    spellCheck="false"
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

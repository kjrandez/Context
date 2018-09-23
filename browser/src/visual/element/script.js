import React, {Component} from 'react';
import Textarea from 'react-textarea-autosize';

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
        this.props.fragment.invoke("update", [event.target.value]);
    }

    modelChanged() {
        var value = this.props.fragment.value();

        this.setState({
            content: value.content
        });
    }

    render() {
        return (
            <Textarea
            className="code-edit"
            spellCheck="false"
            onChange={(ev) => this.onChange(ev)}
            value={this.state.content} />
        );
    }

    componentWillMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect(this);
    }
}

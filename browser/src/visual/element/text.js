import React, {Component} from 'react';
import Textarea from 'react-textarea-autosize';

export default class Text extends Component
{
    constructor(props) {
        super(props);

        var value = this.props.fragment.value();
        this.state = {
            content: value.content
        }

        this.textarea = null;
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
            inputRef={val => (this.textarea = val)}
            className="text-edit"
            onChange={(event) => this.onChange(event)}
            value={this.state.content} />
        );
    }

    componentWillMount() {
        this.props.fragment.connect(this);
    }

    componentDidMount() {
        if(this.props.grabFocus && this.textarea != null) {
            this.textarea.focus();
        }
    }

    componentWillUnmount() {
        this.props.fragment.disconnect(this);
    }
}

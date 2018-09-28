import React, {Component} from 'react';
import ContentEditable from 'react-simple-contenteditable';

export default class Text extends Component
{
    constructor(props) {
        super(props);

        var value = this.props.fragment.value();
        this.state = {
            content: value.content
        }

        this.innerRef = React.createRef();
    }

    modelChanged() {
        var value = this.props.fragment.value();

        this.setState({
            content: value.content
        });
    }

    onChange(ev, value) {
        this.props.fragment.invoke("update", [value]);
    }

    render() {
        return (
            <ContentEditable
            html={this.state.content}
            className="text-edit"
            onChange={(ev, val) => this.onChange(ev, val)}
            contentEditable="plaintext-only"
            ref={this.innerRef}
            onKeyPress={() => {}} />
        );
    }

    componentWillMount() {
        this.props.fragment.connect(this);
    }

    componentDidMount() {
        if(this.props.grabFocus && this.innerRef.current != null) {
            if(this.innerRef.current.elem != null)
                this.innerRef.current.elem.focus();
        }
    }

    componentWillUnmount() {
        this.props.fragment.disconnect(this);
    }
}

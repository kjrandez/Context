import React, {Component} from 'react';
import PlainText from '../plaintext';

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

    onTextSplice(start, stop, insertion) {
        this.props.fragment.invoke("splice", [start, stop, insertion]);
    }

    onTextChange(value) {
        this.props.fragment.invoke("update", [value]);
    }

    render() {
        return (
            <PlainText className="text-edit"
            content={this.state.content}
            onTextChange={val => this.onTextChange(val)}
            onTextSplice={(start, stop, add) => this.onTextSplice(start, stop, add)} />
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

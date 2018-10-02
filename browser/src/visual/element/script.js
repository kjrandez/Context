import React, {Component} from 'react';
import PlainText from '../plaintext';

export default class Script extends Component
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

    onTextInsert(start, insertion, value) {
        console.log("Insert at " + start + "[" + insertion + "]");

        this.props.fragment.invoke("insert", [start, insertion]);
    }

    onTextDelete(start, deletion, value) {
        console.log("Delete at " + start + "[" + deletion + "]");

        this.props.fragment.invoke("delete", [start, deletion.length]);
    }

    onTextChange(value) {
        console.log("Changed to [" + value + "]");

        this.props.fragment.invoke("update", [value]);
    }

    render() {
        return (
            <PlainText className="code-edit"
            content={this.state.content}
            onTextChange={val => this.onTextChange(val)}
            onTextInsert={(start, ins, val) => this.onTextInsert(start, ins, val)}
            onTextDelete={(start, del, val) => this.onTextDelete(start, del, val)} />
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

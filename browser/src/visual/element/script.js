import React, {Component} from 'react';
import PlainText from '../plaintext';

function strSplice(str, index, amount, add) {
    const res = str.substring(0, index) + add + str.substring(index + amount);
    return res;
}

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

    onTextSplice(start, stop, insertion, expected) {
        var newContent = strSplice(this.state.content, start, stop - start, insertion);

        if(newContent !== expected) {
            console.log("Erroneous result");
        }

        this.setState({
            content: expected
        });
        //this.props.fragment.invoke("splice", [start, stop, insertion, expected]);
    }

    onTextChange(value) {
        this.props.fragment.invoke("update", [value]);
    }

    render() {
        return (
            <PlainText className="code-edit"
            content={this.state.content}
            onTextChange={val => this.onTextChange(val)}
            onTextSplice={(start, stop, add, expected) => this.onTextSplice(start, stop, add, expected)} />
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

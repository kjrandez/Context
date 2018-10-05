import React, {Component} from 'react';
import PlainText from '../plaintext';

export default class Text extends Component
{
    constructor(props) {
        super(props);
        this.innerRef = React.createRef();
    }

    render() {
        return (
            <PlainText className="text-edit"
            content={this.props.value.content}
            onTextChange={this.props.action.change}
            onTextSplice={this.props.action.splice} />
        );
    }
    
    componentDidMount() {
        if(this.props.grabFocus && this.innerRef.current != null) {
            if(this.innerRef.current.elem != null)
                this.innerRef.current.elem.focus();
        }
    }
}

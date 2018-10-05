import React, {Component} from 'react';
import PlainText from '../plaintext';

export default class Text extends Component
{
    constructor(props) {
        super(props);
        this.innerRef = React.createRef();
    }

    render() {
        const { value, action } = this.props;

        return (
            <PlainText className="text-edit"
            content={ value.content }
            onTextChange={ action.change }
            onTextSplice={ action.splice } />
        );
    }
    
    componentDidMount() {
        if(this.props.grabFocus && this.innerRef.current != null) {
            if(this.innerRef.current.elem != null)
                this.innerRef.current.elem.focus();
        }
    }
}

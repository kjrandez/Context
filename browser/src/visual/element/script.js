import React, {Component} from 'react';
import ContentEditable from 'react-simple-contenteditable';

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

    onChange(ev, value) {
        this.props.fragment.invoke("update", [value]);
    }

    // Author: Martin Wantke
    // https://stackoverflow.com/questions/2920150/insert-text-at-cursor-in-a-content-editable-div
    insertTextAtCursor(text)
    {
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        range.deleteContents();
        let node = document.createTextNode(text);
        range.insertNode(node);

        for(let position = 0; position !== text.length; position++) {
            selection.modify("move", "right", "character");
        }
    }

    down(ev) {
        if(ev.keyCode === 9) {
            if(this.innerRef.current != null) {
                // Easily broken by changes to react-simple-contenteditable
                this.insertTextAtCursor("\t");
                this.innerRef.current._onChange(ev);
            }
            ev.preventDefault();
        }
    }

    render() {
        return (
            <ContentEditable
            html={this.state.content}
            className="code-edit"
            onChange={(ev, val) => this.onChange(ev, val)}
            contentEditable="plaintext-only"
            ref={this.innerRef}
            onKeyPress={() => {}} 
            onKeyDown={ev => this.down(ev)} />
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

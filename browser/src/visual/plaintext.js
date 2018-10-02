import React, { Component } from 'react';
import ContentEditable from 'react-simple-contenteditable';

var diff = require('fast-diff');

export default class PlainText extends Component
{
    constructor(props) {
        super(props);
        this.ref = React.createRef();
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

    handleRef(newRef) {

    }

    onSelect(ev) {
        console.log(ev);
    }

    onChange(ev, value) {
        var result = diff(this.props.content, value);
        console.log(result);

        var position = 0;

        // So far, actual typing only seems to produce at most 5 sections (with 2 changes)
        if(result.length <= 5) {
            for(var i = 0; i < result.length; i++) {
                const type = result[i][0];
                const text = result[i][1];

                if(type === 1) {
                    this.props.onTextInsert(position, text, value);
                    position += text.length;
                }
                else if(type === -1) {
                    this.props.onTextDelete(position, text, value);
                }
                else {
                    position += text.length;
                }
            }
        }
        else {
            this.props.onTextChange(value);
        }
    }

    onKeyDown(ev) {
        if(ev.keyCode === 9) {
            if(this.ref.current != null) {
                // Easily broken by changes to react-simple-contenteditable
                this.insertTextAtCursor("\t");
                this.ref.current._onChange(ev);
            }
            ev.preventDefault();
        }
    }

    render() {
        const { content, onTextChange, onTextInsert, onTextDelete, ...props } = this.props;

        return (
            <ContentEditable
            ref={ref => this.handleRef(ref)}
            html={this.props.content}
            contentEditable="plaintext-only"
            onChange={(ev, val) => this.onChange(ev, val)}
            onKeyPress={() => {}} 
            onKeyDown={ev => this.onKeyDown(ev)}
            {...props} />
        );
    }
}
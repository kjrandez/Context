import React, { Component } from 'react';
import ContentEditable from 'react-simple-contenteditable';

import diff from 'fast-diff';

export default class PlainText extends Component
{
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.prevOnChangeValue = null;
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

    onChange(ev, value) {
        // Prevent firing of multiple onChange events
        if(value === this.prevOnChangeValue)
            return;
        this.prevOnChangeValue = value;

        var result = diff(this.props.content, value);

        var position = 0;
        var start = null;
        var stop = null;
        var addition = "";

        // Convert insertions and deletions into a single splice

        for(var i = 0; i < result.length; i++) {
            const type = result[i][0];
            const text = result[i][1];

            if(type === 1) {
                // Insertion (this text is not present in original)
                if(start == null) {
                    // This becomes the starting position of the splice
                    start = position;
                }

                // Addition is noted to be spliced in
                addition += text;

                // Position is not advanced
            }
            else if(type === -1) {
                // Deletion (this text IS present in original)
                if(start == null) {
                    // This becomes the starting position of the splice
                    start = position;
                }

                // Advance position in original string
                position += text.length;
            }
            else {
                // Unchanged, advance unless there are no more insertions/deletions
                if(i < result.length - 1) {
                    if(start != null) {
                        // If the splice has already started, this text goes into it
                        addition += text;
                    }

                    // Advance position in original string
                    position += text.length;
                }
            }
        }

        if(start == null) {
            start = 0;
            stop = 0;
        }
        else {
            // Ending point of the splice is the last position we advanced to
            stop = position;
        }

        // Perform the specified splice
        //console.log("Splice from " + start + " to " + stop + "[" + addition + "]");
        this.props.onTextSplice(start, stop, addition);
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
        const { content, onTextChange, onTextSplice, ...props } = this.props;

        return (
            <ContentEditable
            ref={this.ref}
            html={this.props.content}
            contentEditable="plaintext-only"
            onChange={(ev, val) => this.onChange(ev, val)}
            onKeyPress={() => {}} 
            onKeyDown={ev => this.onKeyDown(ev)}
            {...props} />
        );
    }
}
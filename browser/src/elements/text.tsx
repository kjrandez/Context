import React, {Component, ReactElement} from 'react';
import {ElementProps} from '.';
import {TextValue} from '../types';
import marked from 'marked';
import diff from 'fast-diff';
import ContentEditable, {ContentEditableEvent} from 'react-contenteditable';

interface TextProps extends ElementProps { value: TextValue }

export default class Text extends Component<TextProps>
{
    ref: React.RefObject<HTMLDivElement>;
    prevOnChangeValue: string | null;

    constructor(props: TextProps) {
        super(props);
        this.ref = React.createRef();
        this.prevOnChangeValue = null;
    }

    // Author: Martin Wantke
    // https://stackoverflow.com/questions/2920150/insert-text-at-cursor-in-a-content-editable-div
    insertTextAtCursor(text: string)
    {
        let selection = window.getSelection();
        if (selection === null)
            return;
        
        let range = selection.getRangeAt(0);
        range.deleteContents();
        let node = document.createTextNode(text);
        range.insertNode(node);

        // Do something to update the selection
        var cursorRange = document.createRange()
        cursorRange.setStartAfter(node)
        selection.removeAllRanges()
        selection.addRange(cursorRange)
    }

    onChange(ev: ContentEditableEvent) {
        if (this.ref === null || this.ref.current === null)
            return;
        let value = this.ref.current.innerText;

        // Prevent firing of multiple onChange events
        if(value === this.prevOnChangeValue)
            return;
        this.prevOnChangeValue = value;

        var result = diff(this.props.value.content, value);

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
        console.log("Splice from " + start + " to " + stop + "[" + addition + "]");
        this.splice(start, stop, addition);
        //this.props.onTextSplice(start, stop, addition);
    }

    
    strSplice(str: string, index: number, amount: number, add: string) {
        return str.substring(0, index) + add + str.substring(index + amount);
    }

    splice(start: number, stop: number, insertion: string) {
        let node = this.props.store.lookupNode(this.props.path);
        node.element.send("splice", [start, stop, insertion]);
        //this.fragment.invoke("splice", [start, stop, insertion], false);

        const newContent = this.strSplice(this.props.value.content, start, stop - start, insertion);
        this.props.store.db[this.props.eid].value.content = newContent;
    }

    onKeyDown(ev: React.KeyboardEvent<HTMLDivElement>) {
        if(ev.keyCode === 9) {
            if(this.ref !== null) {
            if(this.ref.current !== null) {
                this.insertTextAtCursor("\t");
            }}
            ev.preventDefault();
        }
    }

    render() {
        return (
            <ContentEditable
            innerRef={this.ref}
            html={this.props.value.content} // innerHTML ofthe editable div
            disabled={false}       // use true to disable editing
            onChange={(ev) => this.onChange(ev)} // handle innerHTML change
            onKeyDown={ev => this.onKeyDown(ev)}
            {...this.props}
            />
        );
    }
}

export class Markdown extends Component<TextProps>
{
    markup() {
        return {__html: marked(this.props.value.content)}
    }

    render(): ReactElement {
        let {store, path} = this.props;
        let selected = store.lookupNode(path).selected;

        if (selected)
            return <span className="script-text"><Text {...this.props} /></span>
        else
            return <div dangerouslySetInnerHTML={this.markup()} />
    }
}

export class Script extends Component<TextProps>
{
    render() {
        return <span className="script-text"><Text {...this.props} /></span>;
    }
}

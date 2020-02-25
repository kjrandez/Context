import React, {RefObject, Component, ReactElement, KeyboardEvent, ClipboardEvent, FormEvent} from 'react';
import {ElementProps} from '.';
import {Model, TextValue} from '../../types';
import marked from 'marked';
import {observer} from 'mobx-react';

interface TextProps extends ElementProps {model: Model<TextValue>}

export class Text extends Component<TextProps>
{
    render(): ReactElement {
        let {store, path} = this.props;
        let selected = store.lookupNode(path).selected;

        if (selected)
            return(
                <span className="script-text">
                    <Editable {...this.props} />
                </span>
            );
        else
            return <Markdown {...this.props} />
    }
}

export class Script extends Component<TextProps>
{
    render() {
        let {store, path} = this.props;
        let selected = store.lookupNode(path).selected;

        if (selected)
            return(
                <span className="script-text">
                    <Editable {...this.props} />
                </span>
            );
        else
            return(
                <span className="script-text">
                    <Plain {...this.props} />
                </span>
            );
    }
}

@observer
class Markdown extends Component<TextProps>
{
    markup() {
        return {__html: marked(this.props.model.value.content)}
    }

    render(): ReactElement {
        return <div dangerouslySetInnerHTML={this.markup()} />
    }
}

@observer
class Plain extends Component<TextProps>
{
    render(): ReactElement {
        return <div>{this.props.model.value.content}</div>
    }
}

interface EditableState {content: string}

class Editable extends Component<TextProps, EditableState> {
    elem: RefObject<HTMLDivElement>;
    prevOnChangeValue: string | null;

    constructor(props: TextProps) {
        super(props);
        this.elem = React.createRef();
        this.prevOnChangeValue = null;
        this.state = {
            content: props.model.value.content
        }
    }

    update(value: string) {
        // Unclear if useful:
        // Prevent firing of multiple onChange events
        /*if(value === this.prevOnChangeValue)
            return;
        this.prevOnChangeValue = value;*/

        // Unclear if useful
        //this.setState({content: value});

        // Edit model to match current innerText value
        this.props.store.textAction.edit(this.props.path, value);
    }

    onInput(ev: FormEvent<HTMLDivElement>) {
        if (this.elem === null || this.elem.current === null)
            return;
        
        let value   = this.elem.current.innerText;
        if (value === null)
            value = "";

        this.update(value);
    }

    onPaste(ev: ClipboardEvent<HTMLDivElement>) {
        ev.preventDefault();
        var text = ev.clipboardData.getData("text");
        document.execCommand('insertText', false, text);
    }

    onKeyDown(ev: KeyboardEvent<HTMLDivElement>) {
        if (this.elem === null || this.elem.current === null)
            return;

        console.log("keypress");
        if(ev.keyCode === 9) {
            this.insertTextAtCursor("\t");
            ev.preventDefault();
        }
    }

    // Author: Martin Wantke
    // https://stackoverflow.com/questions/2920150/insert-text-at-cursor-in-a-content-editable-div
    insertTextAtCursor(text: string) {
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

    shouldComponentUpdate(nextProps: never, nextState: EditableState) {
        if (this.elem === null || this.elem.current === null)
            return true;

        return nextState.content !== this.elem.current.innerText;
    }

    render () {
        return (
            <div
                {...this.props}
                ref={this.elem}
                style={{whiteSpace: "pre-wrap"}}
                dangerouslySetInnerHTML={{ __html: this.state.content }}
                contentEditable={"plaintext-only" as unknown as undefined}
                onInput={(ev) => this.onInput(ev)}
                onPaste={(ev) => this.onPaste(ev)}
                onKeyDown={(ev) => this.onKeyDown(ev)}
            />
        )
    }
}

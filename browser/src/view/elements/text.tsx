import React, {RefObject, Component, ReactElement, KeyboardEvent, ClipboardEvent, FormEvent} from 'react';
import {ElementProps} from '.';
import {Model, TextValue} from '../../types';
import marked from 'marked';
import {observer} from 'mobx-react';

interface TextProps extends ElementProps {model: Model<TextValue>}
interface TextState {content: string}

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

class Editable extends Component<TextProps, TextState>
{
    prevOnChangeValue: string | null;

    constructor(props: TextProps) {
        super(props);
        this.prevOnChangeValue = null;
        this.state = {
            content: props.model.value.content
        }
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

    onInput(ev: FormEvent<HTMLDivElement>, value: string) {
        // Prevent firing of multiple onChange events
        if(value === this.prevOnChangeValue)
            return;
        this.prevOnChangeValue = value;

        this.setState({content: value});

        this.props.store.textAction.edit(this.props.path, value);
    }

    onKeyDown(ev: React.KeyboardEvent<HTMLDivElement>) {
        /*if(ev.keyCode === 9) {
            if(this.ref !== null) {
            if(this.ref.current !== null) {
                this.insertTextAtCursor("\t");
            }}
            ev.preventDefault();
        }*/
    }

    render() {
        return (
            <ContentEditable
            contentEditable={"plaintext-only"}
            html={this.state.content} // innerHTML ofthe editable div
            onInput={(ev, value) => this.onInput(ev, value)} // handle innerHTML change
            onKeyPress={() => {}}
            onPaste={() => {}}
            {...this.props}
            />
        );
    }
}

interface ContentEditableProps {
    html: string,
    contentEditable: string | boolean,
    onKeyPress: (ev: KeyboardEvent<HTMLDivElement>, value: string) => void | undefined,
    onPaste: (ev: ClipboardEvent<HTMLDivElement>) => void | undefined,
    onInput: (ev: FormEvent<HTMLDivElement>, value: string) => void | undefined
}

class ContentEditable extends Component<ContentEditableProps> {
    elem: RefObject<HTMLDivElement>;

    constructor(props: ContentEditableProps) {
    super(props);
    this._onInput   = this._onInput.bind(this);
    this._onPaste    = this._onPaste.bind(this);
    this._onKeyPress = this._onKeyPress.bind(this);
    this.elem = React.createRef();
    }

    _onInput(ev: FormEvent<HTMLDivElement>) {
        if (this.elem === null || this.elem.current === null)
            return;
        
        const method  = this.getInnerMethod();
        const value   = this.elem.current[method];

        this.props.onInput(ev, value);
    }

    _onPaste(ev: ClipboardEvent<HTMLDivElement>) {
        const { onPaste, contentEditable } = this.props;

        if (contentEditable === 'plaintext-only') {
            ev.preventDefault();
            var text = ev.clipboardData.getData("text");
            document.execCommand('insertText', false, text);
        }

        if (onPaste) {
            onPaste(ev);
        }
    }

    _onKeyPress(ev: KeyboardEvent<HTMLDivElement>) {
        if (this.elem === null || this.elem.current === null)
            return;
        
        const method  = this.getInnerMethod();
        const value   = this.elem.current[method];

        this.props.onKeyPress(ev, value);
    }

    getInnerMethod () {
        return this.props.contentEditable === 'plaintext-only' ? 'innerText' : 'innerHTML';
    }

    shouldComponentUpdate(nextProps: ContentEditableProps, nextState: never) {
        if (this.elem === null || this.elem.current === null)
            return true;
        
        const method = this.getInnerMethod();
        return nextProps.html !== this.elem.current[method];
    }

    render () {
        const { html, contentEditable, ...props } = this.props;

        return (
            <div
                {...props}
                ref={this.elem}
                dangerouslySetInnerHTML={{ __html: html }}
                contentEditable={ contentEditable === 'false' ? false : true }
                onInput={ this._onInput }
                onPaste={ this._onPaste }
                onKeyPress={ this._onKeyPress }
            />
        )
    }
}
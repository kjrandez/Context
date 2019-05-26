import React, {Component} from 'react';
import { GenericToolbar, ScriptToolbar, PageToolbar, FileToolbar } from '.';
import { ButtonGroup, Divider } from '@blueprintjs/core';
import { GenericAction, PageAction, ScriptAction, FileAction } from '../../action';

export default class Toolbar extends Component
{
    constructor(props) {
        super(props);
        this.contentRef = React.createRef();

        this.state = {
            selection: this.currentSelection(props)
        };
    }

    currentSelection(props) {
        var selection = props.selContent;
        if(selection == null)
            selection = []
        return selection;
    }

    componentWillReceiveProps(newProps) {
        this.setState({ selection: this.currentSelection(newProps) })
    }

    componentDidUpdate() {
        if(this.contentRef.current != null) {
            var rect = this.contentRef.current.getBoundingClientRect();
            if(rect.top < 10) {
                this.contentRef.current.style.marginTop = "10px";
            }
            else if(rect.bottom > (window.innerHeight - 10)) {
                var newTop = window.innerHeight - rect.height - 10;
                this.contentRef.current.style.marginTop = newTop + "px";
            }
        }
    }


    className() {
        return "toolbar-visible";
    }

    toolbarContent(selection) {
        return (
            <div ref={this.contentRef}
            className="toolbar-content"
            style={{marginTop: this.toolbarLoc(selection)}}>
                {this.toolbarContentInner(selection)}
            </div>
        );
    }

    toolbarContentInner() {
        var content = [] ;

        if(this.state.selection.length === 1) {
            var first = this.state.selection[0];
            var fragment = first.fragment;
            var tag = first.tag;
            var value = first.value;
            var type = first.type;

            if(type === "Page") {
                content.push(
                    <PageToolbar 
                    key="specialized"
                    tag={tag}
                    action={new PageAction(this.props.app)} />
                );
                content.push(<Divider key="divider" />);
            }
            else if(type === "Script") {
                content.push(
                    <ScriptToolbar
                    key="specialized"
                    tag={tag}
                    action={new ScriptAction(fragment, this.props.app)} />
                );
                content.push(<Divider key="divider" />);
            }
            else if(type === "FileRef" || type === "ImageRef") {
                content.push(
                    <FileToolbar
                    key="specialized"
                    tag={tag}
                    action={new FileAction(fragment)} />
                )
                content.push(<Divider key="divider" />);
            }
        } 

        content.push(<GenericToolbar
            key="generic"
            selection={this.state.selection}
            action={new GenericAction(this.props.clip, this.props.app)} />);
        
        return <ButtonGroup minimal={false} vertical="true" onMouseEnter={()=>{}}>
            {content}
        </ButtonGroup>;
    }

    toolbarLoc() {
        var firstSel = this.state.selection[0];
        return firstSel.ref.current.getBoundingClientRect().top;
    }

    onMouseDown(event) {
        event.stopPropagation();
    }

    render() {
        if(this.state.selection.length === 0)
            return null;

        return(
            <div id="toolbar"
            className={this.className()}
            onMouseDown={(ev) => this.onMouseDown(ev)}>
                {this.toolbarContent()}
            </div>
        )
    }
}

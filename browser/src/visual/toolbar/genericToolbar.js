import React, { Component } from 'react';
import { Tooltip, Button, Popover, Divider } from '@blueprintjs/core';

export default class GenericToolbar extends Component
{
    infoContent(tag, type) {
        return(
            <div className="info-content">
                <p>Id: {tag.id}</p>
                <p>Type: {type}</p>
                <p>Path: {JSON.stringify(tag.path)}</p>
                <p>Key: {tag.key}</p>
            </div>
        );
    }
       
    perform(call) {
        this.props.selection.forEach(sel => call(sel));
    }

    samePath(path1, path2) {
        return path1.length === path2.length &&
            path1.every((item, index) => item === path2[index]);
    }

    allSelectionsAreNeighbors(selections) {
        var firstPath = selections[0].tag.path;
        
        var i;
        for(i = 1; i < selections.length; i++) {
            if(!this.samePath(firstPath, selections[i].tag.path))
                return false;
        }

        return true;
    }

    commonToolbarButtons(selections, app) {
        var results = [];
        var action = this.props.action;

        if(this.allSelectionsAreNeighbors(selections)) {
            results.push(
                <Tooltip key="c0" content="Indent to sub-page" hoverOpenDelay={250}>
                    <Button icon="double-chevron-right"
                    onClick={() => action.indent(selections)}></Button>
                </Tooltip>
            );

            // Allow unindent if elements are not on the root page
            if(selections[0].tag.path.length > 1) {
                results.push(
                    <Tooltip key="c1" content="Unindent to outer page" hoverOpenDelay={250}>
                        <Button icon="double-chevron-left"
                        onClick={() => action.dedent(selections)}></Button>
                    </Tooltip>
                )
            }

            results.push(<Divider key="cn1" />)
        }

        results.push(
            <Tooltip key="c11" content="Pin to clipboard" hoverOpenDelay={250}>
                <Button icon="pin"
                onClick={() => this.perform(action.pin)}></Button>
            </Tooltip>
        );
    
        results.push(
            <Tooltip key="c2" content="Duplicate to clipboard" hoverOpenDelay={250}>
                <Button icon="duplicate"
                onClick={() => this.perform(action.duplicate)}></Button>
            </Tooltip>
        );
    
        results.push(
            <Tooltip key="c3" content="Cut to clipboard" hoverOpenDelay={250}>
                <Button icon="cut"
                onClick={() => this.perform(action.cut)}></Button>
            </Tooltip>
        );
            
        results.push(
            <Tooltip key="c4" content="Delete" hoverOpenDelay={250}>
                <Button icon="delete"
                onClick={() => this.perform(action.delete)}></Button>
            </Tooltip>
        );

        if(selections.length === 1) {
            var tag = selections[0].tag;
            var type = selections[0].type;
            
            results.push(<Divider key="c5" />);

            results.push(
                <Popover key="c6"
                transitionDuration={70}
                content={this.infoContent(tag, type)}>
                    <Tooltip content="Inspect" hoverOpenDelay={250}>
                        <Button icon="info-sign"></Button>
                    </Tooltip>
                </Popover>
            );
        }

        return results;
    }

    render() {
        return(this.commonToolbarButtons(this.props.selection));
    }
}

import React, { Component } from 'react';
import { Tooltip, Button, Popover, Divider } from '@blueprintjs/core';

export default class GenericToolbar extends Component
{
    infoContent(path, key, fragment) {
        return(
            <div className="info-content">
                <p>Id: {fragment.id()}</p>
                <p>Type: {fragment.type()}</p>
                <p>Path: {JSON.stringify(path)}</p>
                <p>Key: {key}</p>
            </div>
        );
    }
       
    perform(selections, call) {
        selections.forEach(sel => this.props.app.store[call](sel));
    }

    allSelectionsAreNeighbors(selections) {
        var first = selections[0];
        
        var i;
        for(i = 1; i < selections.length; i++) {
            if(!first.samePath(selections[i].loc.path))
                return false;
        }

        return true;
    }

    commonToolbarButtons(selections, app) {
        var results = [];

        if(this.allSelectionsAreNeighbors(selections)) {
            results.push(
                <Tooltip key="c0" content="Indent to sub-page" hoverOpenDelay={250}>
                    <Button icon="double-chevron-right"
                    onClick={() => this.props.app.store.actionIndent(selections)}></Button>
                </Tooltip>
            );

            // Allow unindent if elements are not on the root page
            if(selections[0].loc.path.length > 1) {
                results.push(
                    <Tooltip key="c1" content="Unindent to outer page" hoverOpenDelay={250}>
                        <Button icon="double-chevron-left"
                        onClick={() => this.props.app.store.actionDedent(selections)}></Button>
                    </Tooltip>
                )
            }

            results.push(<Divider key="cn1" />)
        }

        results.push(
            <Tooltip key="c11" content="Pin to clipboard" hoverOpenDelay={250}>
                <Button icon="pin"
                onClick={() => this.perform(selections, "actionPin")}></Button>
            </Tooltip>
        );
    
        results.push(
            <Tooltip key="c2" content="Duplicate to clipboard" hoverOpenDelay={250}>
                <Button icon="duplicate"
                onClick={() => this.perform(selections, "actionDuplicate")}></Button>
            </Tooltip>
        );
    
        results.push(
            <Tooltip key="c3" content="Cut to clipboard" hoverOpenDelay={250}>
                <Button icon="cut"
                onClick={() => this.perform(selections, "actionCut")}></Button>
            </Tooltip>
        );
            
        results.push(
            <Tooltip key="c4" content="Delete" hoverOpenDelay={250}>
                <Button icon="delete"
                onClick={() => this.perform(selections, "actionDelete")}></Button>
            </Tooltip>
        );

        if(selections.length === 1) {
            var fragment = selections[0].fragment;
            var loc = selections[0].loc;
            
            results.push(<Divider key="c5" />);

            results.push(
                <Popover key="c6"
                transitionDuration={70}
                content={this.infoContent(loc.path, loc.key, fragment)}>
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

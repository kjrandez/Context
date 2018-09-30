import React, { Component } from 'react';
import { Button, Popover, Divider } from '@blueprintjs/core';

export default class GenericInspector extends Component
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

    commonInspectorButtons(selections, app) {
        var results = [];

        if(this.allSelectionsAreNeighbors(selections)) {
            results.push(
                <Button title="Indent elements"
                key="c0"
                icon="arrow-right"
                onClick={() => this.props.app.store.actionIndent(selections)}></Button>
            );

            // Allow unindent if elements are not on the root page
            if(selections[0].loc.path.length > 1) {
                results.push(
                    <Button title="Un-indent elements"
                    key="cn2"
                    icon="arrow-left"
                    onClick={() => this.props.app.store.actionDedent(selections)}></Button>
                )
            }

            results.push(<Divider key="cn1" />)
        }

        results.push(
            <Button title="Pin to clipboard"
            key="c1"
            icon="pin"
            onClick={() => this.perform(selections, "actionPin")}></Button>
        );
    
        results.push(
            <Button title="Duplicate to clipboard"
            key="c2"
            icon="duplicate"
            onClick={() => this.perform(selections, "actionDuplicate")}></Button>
        );
    
        results.push(
            <Button title="Cut to clipboard"
            key="c3"
            icon="cut"
            onClick={() => this.perform(selections, "actionCut")}></Button>
        );
            
        results.push(<Button title="Delete"
            key="c4"
            icon="delete"
            onClick={() => this.perform(selections, "actionDelete")}></Button>,
        );

        if(selections.length === 1) {
            var fragment = selections[0].fragment;
            var loc = selections[0].loc;
            
            results.push(<Divider key="c5" />);

            results.push(
                <Popover key="c6"
                transitionDuration={70}
                content={this.infoContent(loc.path, loc.key, fragment)}>
                    <Button title="Inspect" icon="info-sign"></Button>
                </Popover>
            );
        }

        return results;
    }

    render() {
        return(this.commonInspectorButtons(this.props.selection));
    }
}

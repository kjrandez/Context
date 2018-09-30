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

    commonInspectorButtons(selections, app) {
        var results = [
            <Button title="Pin to clipboard"
            key="c1"
            icon="pin"
            onClick={() => this.perform(selections, "actionPin")}></Button>,
    
            <Button title="Duplicate to clipboard"
            key="c2"
            icon="duplicate"
            onClick={() => this.perform(selections, "actionDuplicate")}></Button>,
    
            <Button title="Cut to clipboard"
            key="c3"
            icon="cut"
            onClick={() => this.perform(selections, "actionCut")}></Button>,
            
            <Button title="Delete"
            key="c4"
            icon="delete"
            onClick={() => this.perform(selections, "actionDelete")}></Button>,
        ];

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

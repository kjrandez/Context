import React, { Component } from 'react';
import { Button, Popover, Divider } from '@blueprintjs/core';
import DuplicateElement from '../../duplicateElement';

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
    
    doPin(fragment, clip) {
        clip.invoke("insertAt", [fragment, 0]);
    }
    
    doDuplicate(fragment, clip) {
        clip.invoke("insertAt", [new DuplicateElement(fragment), 0]);
    }
    
    doCut(loc, fragment, clip, store) {
        clip.invoke("insertAt", [fragment, 0]);
        this.doDelete(loc, store);
    }
    
    doDelete(loc, store) {
        var parentId = loc.path[loc.path.length - 1];
        var parent = store.fragment(parentId);
    
        // Remove the entry with this key from the parent
        parent.invoke("remove", [loc.key]);
    }
    
    commonInspectorButtons(loc, fragment, clip, app) {
        return([
            <Button title="Pin to clipboard"
            key="c1"
            icon="pin"
            onClick={() => this.doPin(fragment, clip)}></Button>,
    
            <Button title="Duplicate to clipboard"
            key="c2"
            icon="duplicate"
            onClick={() => this.doDuplicate(fragment, clip)}></Button>,
    
            <Button title="Cut to clipboard"
            key="c3"
            icon="cut"
            onClick={() => this.doCut(loc, fragment, clip, app.store)}></Button>,
            
            <Button title="Delete"
            key="c4"
            icon="delete"
            onClick={() => this.doDelete(loc, app.store)}></Button>,
            
            <Divider key="c5" />,

            <Popover key="c5"
            transitionDuration={70}
            content={this.infoContent(loc.path, loc.key, fragment)}>
                <Button title="Inspect" icon="info-sign"></Button>
            </Popover>,
        ]);
    }

    render() {
        if(this.props.selection.length !== 1)
            return null;
        
        var sel = this.props.selection[0];
        return(this.commonInspectorButtons(
            sel.loc,
            sel.fragment,
            this.props.clip,
            this.props.app
        ));
    }
}

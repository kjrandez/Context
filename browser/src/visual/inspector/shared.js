import React from 'react';
import {Popover, Button, Divider} from '@blueprintjs/core';
import DuplicateElement from '../../duplicateElement';

function infoContent(path, key, fragment) {
    return(
        <div className="info-content">
            <p>Id: {fragment.id()}</p>
            <p>Type: {fragment.type()}</p>
            <p>Path: {JSON.stringify(path)}</p>
            <p>Key: {key}</p>
        </div>
    );
}

function doPin(fragment, clip) {
    clip.invoke("insertAt", [fragment, 0]);
}

function doDuplicate(fragment, clip) {
    clip.invoke("insertAt", [new DuplicateElement(fragment), 0]);
}

function doCut(loc, fragment, clip, store) {
    clip.invoke("insertAt", [fragment, 0]);
    doDelete(loc, store);
}

function doDelete(loc, store) {
    var parentId = loc.path[loc.path.length - 1];
    var parent = store.fragment(parentId);

    // Remove the entry with this key from the parent
    parent.invoke("remove", [loc.key]);
}

export function commonInspectorButtons(loc, fragment, clip, app) {
    return([
        <Button title="Pin to clipboard"
        key="combut1"
        icon="pin"
        onClick={() => doPin(fragment, clip)}></Button>,

        <Button title="Duplicate to clipboard"
        key="combut2"
        icon="duplicate"
        onClick={() => doDuplicate(fragment, clip)}></Button>,

        <Button title="Cut to clipboard"
        key="combut3"
        icon="cut"
        onClick={() => doCut(loc, fragment, clip, app.store)}></Button>,
        
        <Button title="Delete"
        key="combut7"
        icon="delete"
        onClick={() => doDelete(loc, app.store)}></Button>,
        
        <Divider key="combut4" />,
        <Popover key="combut5"
        transitionDuration={70}
        content={infoContent(loc.path, loc.key, fragment)}>
            <Button title="Inspect" icon="info-sign"></Button>
        </Popover>,
    ]);
}

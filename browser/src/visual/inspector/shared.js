import React from 'react';
import {Popover, Button, Divider} from '@blueprintjs/core';

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

function doPin(fragment, paste) {
    paste.invoke("append", [fragment]);
}

function doDelete(loc, store) {
    var parentId = loc.path[loc.path.length - 1];
    var parent = store.fragment(parentId);

    // Remove the entry with this key from the parent
    parent.invoke("remove", [loc.key]);
}

export function commonInspectorButtons(loc, fragment, paste, app) {
    return([
        <Button title="Paste" key="combut0" icon="clipboard"></Button>,

        <Button title="Pin to pasteboard"
        key="combut1"
        icon="pin"
        onClick={() => doPin(fragment, paste)}></Button>,

        <Button title="Duplicate to pasteboard" key="combut2" icon="duplicate"></Button>,
        <Button title="Cut to pasteboard" key="combut3" icon="cut"></Button>,
        
        <Button title="Delete"
        key="combut7"
        icon="delete"
        onClick={() => doDelete(loc, app.store)}></Button>,
        
        <Divider key="combut4" />,
        <Popover key="combut5" content={infoContent(loc.path, loc.key, fragment)}>
            <Button title="Inspect" icon="info-sign"></Button>
        </Popover>,
        
    ]);
}

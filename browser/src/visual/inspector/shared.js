import React from 'react';
import {Popover, Button, Divider} from '@blueprintjs/core';

function infoContent(path, index, fragment) {
    return(
        <div className="info-content">
            <p>Key: {fragment.key()}</p>
            <p>Type: {fragment.type()}</p>
            <p>Path: {JSON.stringify(path)}</p>
            <p>Index: {index}</p>
        </div>
    );
}

export function commonInspectorButtons(path, index, fragment, app) {
    return([
        <Button title="Pin to pasteboard" key="combut1" icon="pin"></Button>,
        <Button title="Duplicate to pasteboard" key="combut2" icon="duplicate"></Button>,
        <Button title="Cut to pasteboard" key="combut3" icon="cut"></Button>,
        <Divider key="combut4" />,
        <Popover key="combut5" content={infoContent(path, index, fragment)}>
            <Button title="Inspect" icon="info-sign"></Button>
        </Popover>
    ]);
}

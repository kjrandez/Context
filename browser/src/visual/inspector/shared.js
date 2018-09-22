import React from 'react';
import {Button, Divider} from '@blueprintjs/core';

export function commonInspectorButtons(path, fragment, app) {
    console.log("React version: "+ React.version);
    return(
        [
        <Button key="combut1" icon="pin"></Button>,
        <Button key="combut2" icon="duplicate"></Button>,
        <Button key="combut3" icon="cut"></Button>,
        <Divider key="combut4" />,
        <Button key="combut5" icon="info-sign"></Button>
        ]
    );
}

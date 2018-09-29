import React, { Component } from 'react';
import { Button } from '@blueprintjs/core';

export default class ScriptInspector extends Component
{
    run(threaded) {
        var path = this.props.loc.path;
        var parentId = path[path.length - 1];
        var parent = this.props.app.store.fragment(parentId)

        if(threaded)
            this.props.fragment.invokeBackground("execute", [parent])
        else
            this.props.fragment.invoke("execute", [parent]);
    }

    render() {
        return([
            <Button key="1"
            title="Run script"
            icon="publish-function"
            onClick={()=>this.run(false)}></Button>,

            <Button key="2"
            title="Run in thread"
            icon="derive-column"
            onClick={()=>this.run(true)}></Button>
        ]);
    }
}

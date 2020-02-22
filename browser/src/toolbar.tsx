import React, {Component, ReactElement} from 'react';

export default class Toolbar extends Component
{
    render(): ReactElement {
        return <div className="toolbar">Toolbar shit <button>Lol</button></div>
    }

    disconnected() {}
}

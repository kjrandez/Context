import React from 'react';
import ReactDOM from 'react-dom';
import Client, { Proxy } from './client';
import ViewState from './state/viewState';
import Top from './components/top';

export default class AppPrevious
{
    viewState: ViewState;

    constructor() {
        this.viewState = new ViewState();
        new Client(
            this.connected.bind(this),
            this.disconnected.bind(this),
            this.broadcast.bind(this)
        );
        ReactDOM.render(<Top viewState={this.viewState} />, document.getElementById('root'));
    }

    broadcast(proxy: Proxy<any>, value: any) {
        this.viewState.modelUpdated(proxy, value);
    }

    async connected(host: Proxy<never>) {
        //let rootPage = await host.call<Proxy<PageModel>>('rootPage', []);
        //this.viewState.navigate(rootPage);
    }

    disconnected() {}
}

import React from 'react';
import ReactDOM from 'react-dom';
import Client, {Proxy} from './client';
import {newStore, Store} from './store';
import Element from './elements';

export default class App
{
    client: Client;
    store: Store | null;

    constructor() {
        this.client = new Client(
            this.connected.bind(this),
            this.disconnected.bind(this),
            this.broadcast.bind(this) 
        );

        this.store = null;
    }

    async broadcast(element: Proxy) {
        if (this.store != null) {
            await this.store.broadcast(element);
        }
    }

    async connected(host: Proxy) {
        let rootPage = await host.call('rootPage', []) as Proxy;
        
        this.store = await newStore(rootPage);
        
        ReactDOM.render(
            <Element store={this.store} path={[]} eid={rootPage.id} />,
            document.getElementById('root')
        );
    }

    disconnected() {}
}

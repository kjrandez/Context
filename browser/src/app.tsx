import React from 'react';
import ReactDOM from 'react-dom';
import Client, {Proxy} from './client';
import {Value} from './types';
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

    async broadcast(element: Proxy<Value>) {
        if (this.store != null) {
            await this.store.broadcast(element);
        }
    }

    async connected(host: Proxy<never>) {
        let rootPage = await host.call<Proxy<any>>('rootPage', []);
        
        this.store = await newStore(rootPage);
        
        ReactDOM.render(
            <Element store={this.store} path={[]} eid={rootPage.id} />,
            document.getElementById('root')
        );
    }

    disconnected() {}
}

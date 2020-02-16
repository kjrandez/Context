import React from 'react';
import ReactDOM from 'react-dom';
import Client, { Proxy } from './client';
import {initialize} from './store';
import {Page} from './elements';

export default class App
{
    constructor() {
        new Client(
            this.connected.bind(this),
            this.disconnected.bind(this),
            this.broadcast.bind(this)
        );
    }

    broadcast(proxy: Proxy<any>, value: any) {
        //this.viewState.modelUpdated(proxy, value);
    }

    async connected(host: Proxy<never>) {
        let rootPage = await host.call<Proxy<any>>('rootPage', []);
        
        let store = await initialize(rootPage);
        
        ReactDOM.render(
            <Page store={store} model={store.db[rootPage.id]} path={[]} />,
            document.getElementById('root')
        );
    }

    disconnected() {}
}


/*export default class Appwef
{
    constructor() {
        let db = {
            0x10000000: {type: "text", text: "hello world!"},
            0x10000001: {type: "text", text: "how are you today?"},
            0x10000002: {type: "page", entries: [
                {index: 100, eid: 0x10000000},
                {index: 101, eid: 0x10000001},
                {index: 102, eid: 0x10000004},
                {index: 103, eid: 0x10000003},
            ]},
            0x10000003: {type: "text", text: "this is fun"},
            0x10000004: {type: "page", entries: [
                {index: 100, eid: 0x10000005},
                {index: 101, eid: 0x10000007},
                {index: 102, eid: 0x10000006}
            ]},
            0x10000005: {type: "text", text: "text on a diff page"},
            0x10000006: {type: "text", text: "and some more for good measure"},
            0x10000007: {type: "image"}
        }
        let root = {
            expanded: true,
            children: {
                102: {expanded: true, children: {}}
            }
        }

        ReactDOM.render(
            <Page store={{db, root}} eid={0x10000002} path={[]} />,
            document.getElementById('root')
        );
    }
}
*/

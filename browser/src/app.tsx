import React, {Component, ReactElement} from 'react';
import Client, {Proxy} from './client';
import {newStore, Store} from './store';
import {Page} from './elements';
import {Model, PageValue} from './types';

interface IAppProps {}
interface IAppState {store: Store | null}

export default class App extends Component<IAppProps, IAppState>
{
    constructor(props: never) {
        super(props);
        this.state = {store: null};
    }

    componentDidMount() {
        new Client(
            this.connected.bind(this),
            this.disconnected.bind(this),
            this.broadcast.bind(this) 
        ).connect();
    }

    async broadcast(element: Proxy) {
        if (this.state.store != null) {
            await this.state.store.broadcast(element);
        }
    }

    async connected(host: Proxy) {
        let rootPage = await host.call('rootPage', []) as Proxy;
        this.setState({
            store: await newStore(rootPage)
        });
    }

    render(): ReactElement {
        if (this.state.store !== null) {
            let {store} = this.state;
            let {db, root: {element: rootPage}} = store;
            let {id: eid, type, value} = db[rootPage.id] as Model<PageValue>;

            return <Page {...{store, type, eid, value, path: []}} />
        } else {
            return <p>Connecting to host...</p>
        }
    }

    disconnected() {}
}

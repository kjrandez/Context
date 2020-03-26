import React, {Component, ReactElement} from 'react';
import Client, {Proxy} from '../client';
import {Store} from '../store';
import {Page} from './elements';
import {Model, PageValue} from '../types';
import Toolbar from './toolbar';

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

        document.addEventListener("keyup", (ev) => this.onKeyPress(ev), false);
    }

    async broadcast(element: Proxy) {
        if (this.state.store != null) {
            await this.state.store.hierarchyAction.broadcast(element);
        }
    }

    async connected(host: Proxy) {
        let rootPage = await host.call('rootPage', []) as Proxy;
        let store = new Store(rootPage);
        await store.hierarchyAction.refresh(null);

        this.setState({store});
    }

    onKeyPress(ev: KeyboardEvent) {
        if(ev.keyCode === 27) {
            if (this.state.store !== null)
                this.state.store.deselect();
        }
    }

    onClick() {
        if (this.state.store !== null)
            this.state.store.deselect();
    }

    render(): ReactElement {
        if (this.state.store !== null) {
            let {store} = this.state;
            let root = store.lookupNode([]);
            let model = store.lookupModel(root.element.id) as Model<PageValue>;

            return(
                <div
                    id="app"
                    onClick={() => this.onClick()}>
                    <Toolbar store={store} />
                    <Page {...{store, model, path: []}} />
                </div>
            );
        } else {
            return <p>Connecting to host...</p>
        }
    }

    disconnected() {}
}
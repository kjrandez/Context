import React, { Component, ReactComponentElement, ReactElement } from "react";
import { Proxy } from "shared";
import Client from "../client";
import { Store } from "../store";
import { Page } from "./elements";
import { Model, PageValue } from "shared";
import Toolbar from "./toolbar";

import SharedComp from "shared/SharedComp";

interface IAppProps {
    relay: {
        send: (msg: string) => void;
        receive: (msg: string) => void;
    };
}
interface IAppState {
    store: Store | null;
}

export default class App extends Component<IAppProps, IAppState> {
    inkRef: React.RefObject<HTMLDivElement> | null;

    constructor(props: never) {
        super(props);
        this.inkRef = null;
        this.state = { store: null };
    }

    componentDidMount() {
        this.props.relay.receive = this.receive.bind(this);
        this.props.relay.send("hello");

        Client.connect(
            this.connected.bind(this),
            this.disconnected.bind(this),
            this.broadcast.bind(this)
        );

        document.addEventListener("keyup", (ev) => this.onKeyPress(ev), false);
    }

    receive(msg: string) {
        this.props.relay.send(`I got "${msg}"`);
    }

    async broadcast(element: Proxy) {
        if (this.state.store != null) {
            await this.state.store.hierarchyAction.broadcast(element);
        }
    }

    async connected(host: Proxy) {
        window.onscroll = () => {
            this.translateInkCanvas(this.inkRef);
        };
        let rootPage = (await host.call("rootPage", [])) as Proxy;
        let store = new Store(host, rootPage, (ref) => {
            if (ref != this.inkRef) {
                this.translateInkCanvas(ref);
            }
            this.inkRef = ref;
        });
        await store.hierarchyAction.refresh(null);

        this.setState({ store });
    }

    private translateInkCanvas(ref: React.RefObject<HTMLDivElement> | null) {
        if (ref == null || ref.current == null) {
            // remove the canvas
            this.props.relay.send("deleteCanvas");
        } else {
            // place the canvas
            let viewportOffset = ref.current.getBoundingClientRect();
            // these are relative to the viewport, i.e. the window
            const { top, left, width, height } = viewportOffset;
            /*const top = viewportOffset.top;
            const left = viewportOffset.left;
            const width = viewportOffset.width;
            const height = viewportOffset.height;*/

            this.props.relay.send(
                `moveCanvas ${top} ${left} ${width} ${height}`
            );
        }
    }

    onKeyPress(ev: KeyboardEvent) {
        if (ev.keyCode === 27) {
            if (this.state.store !== null) this.state.store.deselect();
        }
    }

    onClick() {
        if (this.state.store !== null) this.state.store.deselect();
    }

    render(): ReactElement {
        if (this.state.store !== null) {
            let { store } = this.state;
            let root = store.lookupNode([]);
            let model = store.lookupModel(root.element.id) as Model<PageValue>;

            return (
                <div id="app" onClick={() => this.onClick()}>
                    <Toolbar store={store} />
                    <Page {...{ store, model, path: [] }} />
                </div>
            );
        } else {
            return <SharedComp />;
        }
    }

    disconnected() {}
}

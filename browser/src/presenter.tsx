import React, { ReactElement, Component } from "react";
import { Proxy } from "./state";
import View from './view';
import { AppState } from "./app";

export default abstract class Presenter
{
    state: AppState;
    parentPath: Presenter[];
    path: Presenter[];
    key: number;
    component: Component | null;

    constructor(state: AppState, parentPath: Presenter[], key: number) {
        this.state = state;
        this.parentPath = parentPath;
        this.path = parentPath.concat(this);
        this.key = key;
        this.component = null;
    }

    // Synchronous render, must return quickly
    abstract view(): ReactElement;

    // Populate state asynchronously on load
    abstract async onLoad(): Promise<void>;

    // Update state asynchronously when a foreign object updates
    abstract async onUpdate(subject: Proxy): Promise<void>;

    render(): ReactElement {
        return <View presenter={this} key={this.key} _key={this.key} />
    }

    mount(component: Component) {
        this.component = component;
    }

    unmount(component: Component) {
        if (this.component === component)
            this.component = null;
    }

    refresh() {
        if (this.component != null)
            this.component.forceUpdate();
    }

    parent() {
        return this.parentPath.slice(-1)[0]
    }
}

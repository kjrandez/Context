import React, { ReactElement, Component } from "react";
import View from './view';
import { AppState } from "./app";
import { Subscribable } from "./state";

export interface PresenterArgs {
    state: AppState,
    parentPath: Presenter[],
    key: number
}

export type Attacher = <T>(subscribable: Subscribable<T>, callback: (_: T) => void) => void;

export type AsyncAttacher = <T>(subscribable: Subscribable<T>, callback: (_: T) => Promise<void>) => void

export abstract class Presenter
{
    state: AppState;
    parentPath: Presenter[];
    path: Presenter[];
    key: number;
    component: Component | null;
    mountActions: (() => void)[] = [];
    unmountActions: (() => void)[] = [];

    constructor(args: PresenterArgs) {
        this.state = args.state;
        this.parentPath = args.parentPath;
        this.path = args.parentPath.concat(this);
        this.key = args.key;
        this.component = null;
    }

    async load() {
        await this.init(this.attach.bind(this), this.attachAsync.bind(this));
    }

    abstract async init(attach: Attacher, attachAsync: AsyncAttacher): Promise<void>;

    abstract viewElement(): ReactElement;

    view(): ReactElement {
        return <View presenter={this} key={this.key} _key={this.key} />
    }

    mount(component: Component) {
        this.component = component;
        this.mountActions.forEach(X => X());
    }

    unmount(component: Component) {
        if (this.component === component)
            this.component = null;
        this.unmountActions.forEach(X => X());
    }

    refresh() {
        if (this.component != null)
            this.component.forceUpdate();
    }

    parent() {
        return this.parentPath.slice(-1)[0]
    }
    
    // See both answers:
    // https://stackoverflow.com/questions/42804182/generic-factory-parameters-in-typescript

    protected async make<T extends Presenter, A extends PresenterArgs>
    (   ctor: {new (_: A): T},
        args: A
    ): Promise<T> {
            
        let inst = new ctor(args);
        await inst.load();
        return inst;
    }

    // Child Constructor Args
    protected ccargs(key: number): PresenterArgs {
        return {
            state: this.state,
            parentPath: this.path,
            key: key
        }
    }

    private attach<T>(subscribable: Subscribable<T>, callback: (_:T) => void) {
        this.mountActions.push(() => { subscribable.attach(this.path, callback) });
        this.unmountActions.push(() => { subscribable.detach(this.path) });
    }

    private attachAsync<T>(subscribable: Subscribable<T>, callback: (_:T) => Promise<void>) {
        this.mountActions.push(() => { subscribable.attachAsync(this.path, callback) });
        this.unmountActions.push(() => { subscribable.detachAsync(this.path) });
    }
}

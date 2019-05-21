import React, { ReactElement, Component } from "react";
import View from './view';
import { AppState } from "./app";
import { Subscribable } from "./state";

export type Attacher = <T>(subscribable: Subscribable<T>, callback: (_: T) => void) => void;

export abstract class Presenter
{
    state: AppState;
    parentPath: Presenter[];
    path: Presenter[];
    key: number;
    component: Component | null;
    mountActions: (() => void)[] = [];
    unmountActions: (() => void)[] = [];

    constructor(state: AppState, parentPath: Presenter[], key: number) {
        this.state = state;
        this.parentPath = parentPath;
        this.path = parentPath.concat(this);
        this.key = key;
        this.component = null;

        this.init(this.attach.bind(this));
    }

    abstract init(attach: Attacher): void;

    abstract viewElement(): ReactElement;

    private attach<T>(subscribable: Subscribable<T>, callback: (_:T) => void) {
        this.mountActions.push(() => { subscribable.attach(this.path, callback) });
        this.unmountActions.push(() => { subscribable.detach(this.path) });
    }

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
}

// See both answers:
// https://stackoverflow.com/questions/42804182/generic-factory-parameters-in-typescript

export interface AsyncPresenterArgs {
    state: AppState,
    parentPath: AsyncPresenter[],
    key: number
}

export type AsyncAttacher = <T>(subscribable: Subscribable<T>, callback: (_: T) => Promise<void>) => void

export abstract class AsyncPresenter extends Presenter
{
    parentPath: AsyncPresenter[];
    path: AsyncPresenter[];

    constructor(args: AsyncPresenterArgs) {
        super(args.state, args.parentPath, args.key);
        this.parentPath = args.parentPath;
        this.path = args.parentPath.concat(this);
    }

    abstract async initAsync(attach: AsyncAttacher): Promise<void>;

    private attachAsync<T>(subscribable: Subscribable<T>, callback: (_:T) => Promise<void>) {
        this.mountActions.push(() => { subscribable.attachAsync(this.path, callback) });
        this.unmountActions.push(() => { subscribable.detachAsync(this.path) });
    }

    async make<T extends AsyncPresenter, A extends AsyncPresenterArgs>
    (   ctor: {new (_: A): T},
        args: A
    ): Promise<T> {
            
        let inst = new ctor(args);
        await inst.load();
        return inst;
    }

    // Child Constructor Args
    ccargs(key: number): AsyncPresenterArgs {
        return {
            state: this.state,
            parentPath: this.path,
            key: key
        }
    }

    async load() {
        await this.initAsync(this.attachAsync.bind(this));
    }
}

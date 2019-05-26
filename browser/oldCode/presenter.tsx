import React, { ReactElement, Component } from "react";
import View from './view';
import { AppState } from "./app";
import { Subscribable } from "./state";
import { mapObj } from "./interfaces";

// See both answers:
// https://stackoverflow.com/questions/42804182/generic-factory-parameters-in-typescript

export function make<T extends Presenter, A extends PresenterArgs>
(   ctor: {new (_: A): T},
    args: A
): T {
    let inst = new ctor(args);
    inst.load();
    return inst;
}

export async function makeAsync<T extends Presenter, A extends PresenterArgs>
(   ctor: {new (_: A): T},
    args: A
): Promise<T> {
    let inst = new ctor(args);
    await inst.load();
    return inst;
}

export interface PresenterArgs {
    state: AppState,
    parentPath: Presenter[],
    key: string
}

export abstract class Presenter
{
    state: AppState;
    parentPath: Presenter[];
    path: Presenter[];
    key: string;
    component: Component | null;
    sensitivities: Subscribable[] = [];
    children: {[_:string]: Presenter} = {};
    
    constructor(args: PresenterArgs) {
        this.state = args.state;
        this.parentPath = args.parentPath;
        this.path = args.parentPath.concat(this);
        this.key = args.key;
        this.component = null;
    }

    subscriptions(): Subscribable[] { return []; }
    stateChanged(): void {}
    abstract viewElement(): ReactElement;

    load() {
        this.sensitivities = this.subscriptions();
        this.sensitivities.forEach(X => X.attach(this.path));
        this.stateChanged();
    }

    unload() {
        this.sensitivities.forEach(X => X.detach(this.path));
    }

    view(): ReactElement {
        return <View presenter={this} key={this.key} />
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

    content() {
        return mapObj(this.children, (child) => child.view());
    }

    removeChild(key: string) {
        if (!(key in this.children))
            throw new Error("No child added with that key.");
        this.children[key].unload();
        delete this.children[key];
    }

    removeChildIfPresent(key: string) {
        let child = this.children[key]
        if (child != null) {
            child.unload();
            delete this.children[key];
        }
    }

    addChild(child: Presenter) {
        if (child.key in this.children)
            throw new Error("Child already added with that key.");
        this.children[child.key] = child;
    }

    addNewChild<T extends Presenter, A extends PresenterArgs>(
        ctor: {new (_: A): T},
        args: A
    ) : T
    {
        let child = make(ctor, args);
        this.addChild(child);
        return child;
    }

    protected ccargs(key: string): PresenterArgs {
        return {
            state: this.state,
            parentPath: this.path,
            key: key
        }
    }
}

export interface AsyncPresenterArgs extends PresenterArgs {
    state: AppState,
    parentPath: AsyncPresenter[],
    key: string
}

export abstract class AsyncPresenter extends Presenter
{
    parentPath: AsyncPresenter[];
    path: AsyncPresenter[];
    sensitivitiesAsync: Subscribable[] = [];

    constructor(args: AsyncPresenterArgs) {
        super(args);
        this.parentPath = args.parentPath;
        this.path = args.parentPath.concat(this);
    }

    async load(): Promise<void> {
        super.load();
        this.sensitivitiesAsync = this.subscriptionsAsync();
        await this.stateChangedAsync();
    }

    subscriptionsAsync(): Subscribable[] { return []; }
    async stateChangedAsync(): Promise<void> {};

    mount(component: Component) {
        super.mount(component);
        this.sensitivitiesAsync.forEach(X => X.attachAsync(this.path));
    }

    unmount(component: Component) {
        super.unmount(component);
        this.sensitivitiesAsync.forEach(X => X.detachAsync(this.path));
    }

    async addNewChildAsync<T extends Presenter, A extends PresenterArgs>(
        ctor: {new (_: A): T},
        args: A
    ) : Promise<T>
    {
        let child = await makeAsync(ctor, args);
        this.addChild(child);
        return child;
    }

    protected ccargs(key: string): AsyncPresenterArgs {
        return {
            state: this.state,
            parentPath: this.path,
            key: key
        }
    }
}

import React, { ReactElement, Component } from "react";
import View from './view';
import { AppState } from "./app";
import { Subscribable } from "./state";

// See both answers:
// https://stackoverflow.com/questions/42804182/generic-factory-parameters-in-typescript

export async function make<T extends Presenter, A extends PresenterArgs>
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
    key: number
}

export abstract class Presenter
{
    state: AppState;
    parentPath: Presenter[];
    path: Presenter[];
    key: number;
    component: Component | null;
    sensitivities: Subscribable[] = [];
    
    constructor(args: PresenterArgs) {
        this.state = args.state;
        this.parentPath = args.parentPath;
        this.path = args.parentPath.concat(this);
        this.key = args.key;
        this.component = null;
    }

    subscriptions(): Subscribable[] { return []; }
    update(): void {}
    abstract viewElement(): ReactElement;

    load() {
        this.sensitivities = this.subscriptions();
        this.update();
    }

    view(): ReactElement {
        return <View presenter={this} key={this.key} />
    }

    mount(component: Component) {
        this.component = component;
        this.sensitivities.forEach(X => X.attach(this.path));
    }

    unmount(component: Component) {
        if (this.component === component)
            this.component = null;
        this.sensitivities.forEach(X => X.detach(this.path));
    }

    refresh() {
        if (this.component != null)
            this.component.forceUpdate();
    }

    parent() {
        return this.parentPath.slice(-1)[0]
    }

    protected ccargs(key: number): PresenterArgs {
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
    key: number
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
        await this.updateAsync();
    }

    subscriptionsAsync(): Subscribable[] { return []; }
    async updateAsync(): Promise<void> {};

    mount(component: Component) {
        super.mount(component);
        this.sensitivitiesAsync.forEach(X => X.attachAsync(this.path));
    }

    unmount(component: Component) {
        super.unmount(component);
        this.sensitivitiesAsync.forEach(X => X.detachAsync(this.path));
    }

    protected ccargs(key: number): AsyncPresenterArgs {
        return {
            state: this.state,
            parentPath: this.path,
            key: key
        }
    }
}

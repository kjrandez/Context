import React, { ReactElement, Component } from "react";
import View from './view';
import { AppState } from "./app";

export abstract class Presenter
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

    abstract view(): ReactElement;

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

// See both answers:
// https://stackoverflow.com/questions/42804182/generic-factory-parameters-in-typescript

export interface AsyncPresenterArgs
{
    key: number;
}

export abstract class AsyncPresenter extends Presenter
{
    parentPath: AsyncPresenter[];
    path: AsyncPresenter[];

    constructor(state: AppState, parentPath: AsyncPresenter[], args: AsyncPresenterArgs) {
        super(state, parentPath, args.key);
        this.parentPath = parentPath;
        this.path = parentPath.concat(this);
    }

    async make<T extends AsyncPresenter, A extends AsyncPresenterArgs>(
        ctor: {new (_: AppState, __: AsyncPresenter[], ___: A): T}, args: A): Promise<T> {
            
        let inst = new ctor(this.state, this.path, args);
        await inst.load();
        return inst;
    }

    abstract async load(): Promise<void>;
}

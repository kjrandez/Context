import React, { ReactElement } from 'react';
import Proxy from './proxy';

export interface Proxyable {
    proxyableId: number | null;
}

export abstract class Presenter
{
    // Synchronous render, must return quickly
    abstract view(): ReactElement;

    // Update data asynchronously if necessary
    abstract async fetch(): Promise<any>;

    // Hook to update information asynchronously when a connected model has changed
    abstract modelChanged(object: Proxy, model: Model): Promise<void>;

    async fetchView(): Promise<ReactElement> {
        await this.fetch();
        return this.view();
    }
}

export abstract class DynamicPresenter extends Presenter
{
    //contentChanged(): void;
}

export type Argument = { [_: string]: any }

export type Model = { [_: string]: any }

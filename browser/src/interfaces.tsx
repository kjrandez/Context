import React, { ReactElement } from 'react';
import Proxy from './proxy';

export interface Proxyable {
    proxyableId: number | null;
}

export interface DynamicPresenter extends Presenter
{
    contentChanged(): void;
}

export interface Presenter
{
    modelChanged(object: Proxy, model: any): void;
    render(): ReactElement;
}

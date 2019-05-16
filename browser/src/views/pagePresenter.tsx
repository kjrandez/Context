import React, { ReactElement } from 'react';
import { DynamicPresenter } from '../interfaces';
import Proxy from '../proxy';

export default class PagePresenter implements DynamicPresenter
{
    parent: DynamicPresenter;
    page: Proxy;

    constructor(parent: DynamicPresenter, page: Proxy) {
        this.parent = parent;
        this.page = page;

        this.loadContents().then();
    }

    async loadContents() {
        var model = await this.page.call('model');
    }

    modelChanged(object: Proxy, model: any): void {
        throw new Error("Method not implemented.");
    }

    contentChanged(): void {
    }

    render(): ReactElement {
        return <div></div>;
    }
}

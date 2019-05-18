import React, { ReactElement } from 'react';
import { DynamicPresenter } from '../interfaces';
import Proxy from '../proxy';

export default class PagePresenter extends DynamicPresenter
{
    parent: DynamicPresenter;
    page: Proxy;
    content: string | null;

    constructor(parent: DynamicPresenter, page: Proxy) {
        super();

        this.parent = parent;
        this.page = page;
        this.content = null;
    }

    view(): ReactElement {
        if (this.content == null)
            return <div>No content loaded</div>;
        
        return <div>{this.content.toString()}</div>;
    }

    async fetch(): Promise<void> {
        this.content = JSON.stringify(await this.page.call('model'));
        console.log(this.content)
    }

    async modelChanged(object: Proxy, model: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

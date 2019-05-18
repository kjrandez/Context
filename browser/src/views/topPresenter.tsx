import React, { ReactElement } from 'react';
import App from '../app';
import Proxy from '../proxy';
import { Presenter } from '../interfaces';
import PagePresenter from './pagePresenter';

export default class TopPresenter extends Presenter
{
    app: App;
    pagePresenter: PagePresenter | null;
    pageContent: ReactElement | null;

    constructor(app: App, page: Proxy | null) {
        super();
        
        this.app = app;

        if (page != null)
            this.pagePresenter = new PagePresenter(this, 0, page);
        else
            this.pagePresenter = null;

        this.pageContent = null;
    }

    view(): ReactElement {
        if (this.pageContent == null)
            return <div>No Content</div>;
        
        return <div>{this.pageContent}</div>;
    }

    async fetch(): Promise<void> {
        if (this.pagePresenter != null)
            this.pageContent = await this.pagePresenter.fetchView();
    }

    async modelChanged(object: Proxy, model: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

import React, { ReactElement } from 'react';
import App from '../app';
import Proxy from '../proxy';
import { DynamicPresenter } from '../interfaces';
import PagePresenter from './pagePresenter';

export default class TopPresenter implements DynamicPresenter
{
    app: App;
    pagePresenter: PagePresenter | null;

    constructor(app: App, page: Proxy | null) {
        this.app = app;

        if (page != null)
            this.pagePresenter = new PagePresenter(this, page);
        else
            this.pagePresenter = null;
    }

    modelChanged(object: Proxy, model: any): void {
        throw new Error("Method not implemented.");
    }

    contentChanged(): void {
        this.app.rootChanged();
    }

    render(): ReactElement {
        if (this.pagePresenter == null)
            return <div>Top</div>;
        else
            return <div>Content</div>;
    }
}

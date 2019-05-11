import React, { ReactElement } from 'react';
import App from '../app';
import Fragment from '../fragment';
import DynamicPresenter from '../dynamicPresenter';
import PagePresenter from './pagePresenter';

export default class TopPresenter implements DynamicPresenter
{
    app: App;
    pagePresenter: PagePresenter | null;

    constructor(app: App, page: Fragment | null) {
        this.app = app;

        if (page != null)
            this.pagePresenter = new PagePresenter(this, page);
        else
            this.pagePresenter = null;
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

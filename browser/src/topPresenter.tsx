import React, { ReactElement } from 'react';
import App from './app';
import Proxy from './proxy';
import Presenter from './presenter';
import PagePresenter from './views/pagePresenter';

export default class TopPresenter extends Presenter
{
    app: App;
    pagePresenter: PagePresenter | null;

    constructor(app: App, page: Proxy | null) {
        super([], 0); // Root
        
        this.app = app;

        if (page != null)
            this.pagePresenter = new PagePresenter(this.path, 0, page);
        else
            this.pagePresenter = null;
    }

    view(): ReactElement {
        if (this.pagePresenter == null)
            return <div>No Content</div>;
        
        return this.pagePresenter.render();
    }

    async onLoad(): Promise<void> {
        if (this.pagePresenter != null)
            await this.pagePresenter.onLoad();
    }

    async onChange(subject: Proxy): Promise<void> {
        if (this.pagePresenter != null)
            await this.pagePresenter.onChange(subject);
    }
}

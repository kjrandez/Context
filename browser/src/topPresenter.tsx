import React, { ReactElement } from 'react';
import { AppState } from './app';
import { Proxy } from './state';
import Presenter from './presenter';
import PagePresenter from './views/pagePresenter';

export default class TopPresenter extends Presenter
{
    pagePresenter: PagePresenter;

    constructor(state: AppState, page: Proxy) {
        super(state, [], 0); // Root
        
        this.state = state;
        this.pagePresenter = new PagePresenter(this.state, this.path, 0, page);
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

    async onUpdate(subject: Proxy): Promise<void> {
        if (this.pagePresenter != null)
            await this.pagePresenter.onUpdate(subject);
    }

    abandoned() {
        this.pagePresenter.abandoned();
    }
}

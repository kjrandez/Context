import React, { ReactElement } from 'react';
import { Proxy } from './state';
import { AsyncPresenter, AsyncPresenterArgs } from './presenter';
import PagePresenter from './views/pagePresenter';

export interface TopPresenterArgs extends AsyncPresenterArgs { page: Proxy<any>; }

export default class TopPresenter extends AsyncPresenter
{
    pagePresenter: PagePresenter | null = null;

    async load(): Promise<void> {
        let initialPage = this.state.topPage.get();
        this.state.topPage.attachAsync(this.path, this.onPageChanged.bind(this))

        await this.setPagePresenter(initialPage);
    }

    async onPageChanged(page: Proxy<any> | null): Promise<void> {
        await this.setPagePresenter(page);
    }

    async setPagePresenter(page: Proxy<any> | null) {
        if (this.pagePresenter != null)
            this.pagePresenter.abandoned();

        if (page != null)
            this.pagePresenter = await this.make(PagePresenter, {key: 0, subject: page});
        else
            this.pagePresenter = null;
    }

    view(): ReactElement {
        if (this.pagePresenter == null)
            return <div>No Content</div>;
        
        return this.pagePresenter.render();
    }

    abandoned() {
        if (this.pagePresenter != null)
            this.pagePresenter.abandoned();
    }
}

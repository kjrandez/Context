import React, { ReactElement } from 'react';
import { Proxy } from './state';
import { AsyncPresenter, AsyncPresenterArgs } from './presenter';
import PagePresenter from './views/pagePresenter';
import { AppState } from './app';

export interface TopPresenterArgs extends AsyncPresenterArgs { page: Proxy<any>; }

export default class TopPresenter extends AsyncPresenter
{
    page: Proxy<any>;
    pagePresenter: PagePresenter | null = null;

    constructor(state: AppState, parentPath: AsyncPresenter[], args: TopPresenterArgs) {
        super(state, parentPath, args);
        this.page = args.page;
    }

    async load(): Promise<void> {
        this.pagePresenter = await this.make(PagePresenter, {key: 0, subject: this.page});
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

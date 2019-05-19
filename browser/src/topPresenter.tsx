import React, { ReactElement } from 'react';
import { Proxy } from './state';
import { AsyncPresenter, AsyncPresenterArgs } from './presenter';
import PagePresenter from './views/pagePresenter';

export interface TopPresenterArgs extends AsyncPresenterArgs {
    page: Proxy;
}

export default class TopPresenter extends AsyncPresenter
{
    page: Proxy;
    pagePresenter: PagePresenter | null = null;

    constructor(args: TopPresenterArgs) {
        super(args);
        this.page = args.page;
    }

    async load(): Promise<void> {
        this.pagePresenter = await this.make(PagePresenter, {...this.def(0), subject: this.page});
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

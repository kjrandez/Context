import React, { ReactElement } from 'react';
import { Proxy } from '../state';
import { AsyncPresenter, AsyncPresenterArgs, make } from '../presenter';
import PagePresenter from './pagePresenter';
import TopView from './topView';

export interface TopPresenterArgs extends AsyncPresenterArgs { page: Proxy<any>; }

export default class TopPresenter extends AsyncPresenter
{
    pagePresenter: PagePresenter | null = null;

    subscriptionsAsync() {
        return [this.state.topPage]
    }

    async updateAsync(): Promise<void> {
        let page = this.state.topPage.get();
        await this.setPagePresenter(page);
    }

    async setPagePresenter(page: Proxy<any> | null) {
        if (page != null)
            this.pagePresenter = await make(PagePresenter, {...this.ccargs(0), subject: page});
        else
            this.pagePresenter = null;
    }

    onMouseDown() {}

    viewElement(): ReactElement {
        let props = {
            onMouseDown: this.onMouseDown.bind(this),
            pageContent: (this.pagePresenter == null) ? <></> :this.pagePresenter.view()
        }
        
        return <TopView 
            sidePanelContent={<div>Side Panel</div>}
            toolbarContent={<div>Toolbar</div>}
            pageHeader={<div>Page Header</div>}
            {...props} />
    }
}

import React, { ReactElement } from 'react';
import { Proxy } from '../state';
import { Presenter, PresenterArgs, Attacher, AsyncAttacher } from '../presenter';
import PagePresenter from './pagePresenter';
import TopView from './topView';

export interface TopPresenterArgs extends PresenterArgs { page: Proxy<any>; }

export default class TopPresenter extends Presenter
{
    pagePresenter: PagePresenter | null = null;

    async init(_: Attacher, attachAsync: AsyncAttacher): Promise<void> {
        attachAsync(this.state.topPage, this.onPageChanged.bind(this));

        let initialPage = this.state.topPage.get();
        await this.setPagePresenter(initialPage);
    }

    async onPageChanged(page: Proxy<any> | null) {
        await this.setPagePresenter(page);
    }

    async setPagePresenter(page: Proxy<any> | null) {
        if (page != null)
            this.pagePresenter = await this.make(PagePresenter, {...this.ccargs(0), subject: page});
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

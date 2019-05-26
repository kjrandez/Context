import React, { ReactElement } from 'react';
import { Proxy } from '../state';
import { AsyncPresenter, AsyncPresenterArgs } from '../presenter';
import PagePresenter from './pagePresenter';
import TopView from './topView';

export interface TopPresenterArgs extends AsyncPresenterArgs { page: Proxy<any>; }

export default class TopPresenter extends AsyncPresenter
{
    pagePresenter: PagePresenter | null = null;

    subscriptionsAsync() {
        return [this.state.topPage]
    }

    async stateChangedAsync(): Promise<void> {
        let page = this.state.topPage.get();
        await this.setPagePresenter(page);
    }

    async setPagePresenter(page: Proxy<any> | null) {
        this.removeChildIfPresent("page");
        if (page != null)
            await this.addNewChildAsync(PagePresenter, {...this.ccargs("page"), subject: page});
    }

    onMouseDown() {}

    viewElement(): ReactElement {
        return React.createElement(TopView, {
            onMouseDown: () => this.onMouseDown,
            content: this.content()
        });
    }
}

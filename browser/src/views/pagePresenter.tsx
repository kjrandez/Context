import React, { ReactElement } from 'react';
import DynamicPresenter from '../dynamicPresenter';
import Fragment from '../fragment';

export default class PagePresenter implements DynamicPresenter
{
    parent: DynamicPresenter;
    page: Fragment;

    constructor(parent: DynamicPresenter, page: Fragment) {
        this.parent = parent;
        this.page = page;

        setTimeout(this.loadContents, 0);
    }

    async loadContents() {
        var model = await this.page.invokeAsync('model');
    }

    contentChanged(): void {
    }

    render(): ReactElement {
        return <div></div>;
    }
}

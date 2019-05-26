import React, { ReactElement } from 'react';
import { Proxy } from '../state';
import TilePresenter from './tilePresenter';
import PageView from './pageView';
import ElementPresenter, { ElementPresenterArgs } from '../elementPresenter';

type PageValue = {
    entries: {
        key: number,
        element: Proxy<any>
    }[];
    latestEntry: Proxy<any> | null;
}

export default class PagePresenter extends ElementPresenter
{
    subject: Proxy<PageValue>;
    childOrder: string[] = [];

    constructor(args: ElementPresenterArgs) {
        super(args);
        this.subject = args.subject;
    }

    subscriptionsAsync() { return [this.subject]; }

    async stateChangedAsync() {
        let value: PageValue = await this.subject.call('value');
        await this.fetchChildren(value);
    }

    viewElement(): ReactElement {
        return <PageView
            key={this.key}
            title="Page Title"
            order={this.childOrder}
            content={this.content()} />
    }

    private async fetchChildren(pageValue: PageValue): Promise<void> {
        // Object.entries has trouble with number-keyed objects in Typescript
        this.childOrder = pageValue.entries.map(X => X.key.toString());

        // Remove the entries which are no longer part of the page's value
        let prevEntries = Object.keys(this.children);
        for (const key of prevEntries) {
            if (!this.childOrder.includes(key))
                this.removeChild(key)
        }

        // Create presenters for those children which are not yet populated
        for (const entry of pageValue.entries) {
            let key = entry.key.toString();
            if (!(key in this.children)) {
                let subject = entry.element;
                await this.addNewChildAsync(TilePresenter, {...this.ccargs(key), subject});
            }
        }
    }
}

import React, { ReactElement } from 'react';
import { Proxy } from '../state';
import ElementPresenter from './elementPresenter';
import PageView from './pageView';
import ASpecializedPresenter, { ASpecializedPresenterArgs } from '../specializedPresenter';
import { AsyncAttacher } from '../presenter';

type PageValue = {
    entries: {
        key: number,
        element: Proxy<any>
    }[];
    latestEntry: Proxy<any> | null;
}

export default class PagePresenter extends ASpecializedPresenter
{
    subject: Proxy<PageValue>;
    children: {[_: string]: ElementPresenter} = {};
    childOrder: string[] | null = null;

    constructor(args: ASpecializedPresenterArgs) {
        super(args);
        this.subject = args.subject;
    }

    init() {}

    async initAsync(attach: AsyncAttacher): Promise<void> {
        attach(this.subject, this.onUpdate.bind(this));
        let value: PageValue = await this.subject.call('value');
        await this.fetchChildren(value);
    }

    async onUpdate(value: PageValue): Promise<void> {
        await this.fetchChildren(value);
    }

    viewElement(): ReactElement {
        if (this.childOrder == null) {
            return <div>No content loaded</div>;
        }
        else {
            let content: ReactElement[] = [];
            for (const key of this.childOrder) {
                
                let child = this.children[key];
                if (child != null) 
                    content.push(child.view());
            }

            return <PageView key={this.key} title="Page Title" content={content} />
        }
    }

    private async fetchChildren(pageValue: PageValue): Promise<void> {
        // Object.entries has trouble with number-keyed objects in Typescript
        this.childOrder = pageValue.entries.map(X => X.key.toString());

        // Remove the entries which are no longer part of the page's value
        let prevEntries = Object.keys(this.children);
        for (const key of prevEntries) {
            if (!this.childOrder.includes(key)) {
                delete this.children[key];
            }
        }

        // Create presenters for those children which are not yet populated
        for (const entry of pageValue.entries) {
            if (!(entry.key in this.children)) {
                let subject = entry.element;
                let child = await this.make(ElementPresenter, {...this.ccargs(entry.key), subject});
                this.children[entry.key] = child;
            }
        }
    }
}

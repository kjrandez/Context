import React, { ReactElement, Children } from 'react';
import { Presenter, Model } from '../interfaces';
import Proxy from '../proxy';
import ElementPresenter from './elementPresenter';
import UnknownPresenter from './unknownPresenter';
import TextPresenter from './textPresenter';
import PageView from './pageView';

type PageValue = {
    entries: {
        key: number,
        element: Proxy
    }[];
    latestEntry: Proxy | null;
}

export default class PagePresenter extends ElementPresenter
{
    // Delayed load
    content: string | null = null;
    children: Presenter[] | null = null;

    view(): ReactElement {
        if (this.children == null)
            return <div>No content loaded</div>;
        
        return <PageView key={this.key} title="Page Title" content={this.children.map(X => X.view())} />
    }

    async fetch(): Promise<void> {
        let pageValue: PageValue = await this.element.call('value');

        this.children = []
        for (const entry of pageValue.entries) {
            let type = await entry.element.call<string>('type')
            let child = this.presenterForEntry(entry.key, type, entry.element)
            await child.fetch();
            this.children.push(child)
        }
    }

    async modelChanged(object: Proxy, model: Model<PageValue>): Promise<void> {
        throw new Error("Method not implemented.");
    }

    presenterForEntry(key: number, type: string, element: Proxy): Presenter {
        switch(type) {
            case 'Text': return new TextPresenter(this, key, element);
            case 'Page': return new PagePresenter(this, key, element);
            default: return new UnknownPresenter(this, key, element);
        }
    }
}

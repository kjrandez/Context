import React, { ReactElement, Children } from 'react';
import { Presenter } from '../interfaces';
import Proxy from '../proxy';
import ElementPresenter from './elementPresenter';
import UnknownPresenter from './unknownPresenter';
import TextPresenter from './textPresenter';

type PageValue = {
    content: {
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
        
        return <div style={{marginLeft: '20px'}}>
            {this.children.map(X => X.view())}
        </div>
    }

    async fetch(): Promise<void> {
        let pageValue: PageValue = await this.element.call('value');

        this.children = []
        for (const entry of pageValue.content) {
            let type = await entry.element.call('type')
            let child = this.presenterForEntry(entry.key, type, entry.element)
            await child.fetch();
            this.children.push(child)
        }
    }

    async modelChanged(object: Proxy, model: any): Promise<void> {
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

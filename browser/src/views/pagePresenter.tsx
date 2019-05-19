import React, { ReactElement } from 'react';
import { Proxy } from '../state';
import ElementPresenter from '../elementPresenter';
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
    children: {[_: string]: ElementPresenter} = {};
    childOrder: string[] | null = null;

    async load(): Promise<void> {
        await this.fetchChildren();
    }

    async onUpdate(_: Proxy): Promise<void> {
        await this.fetchChildren();
    }

    view(): ReactElement {
        if (this.childOrder == null) {
            return <div>No content loaded</div>;
        }
        else {
            let content: ReactElement[] = [];
            for (const key of this.childOrder) {
                
                let child = this.children[key];
                if (child != null) 
                    content.push(child.render());
            }

            return <PageView key={this.key} title="Page Title" content={content} />
        }
    }

    private async fetchChildren(): Promise<void> {
        let pageValue: PageValue = await this.subject.call('value');

        // Object.entries has trouble with number-keyed objects in Typescript
        this.childOrder = pageValue.entries.map(X => X.key.toString());

        // Remove the entries which are no longer part of the page's value
        let prevEntries = Object.entries(this.children);
        for (const [key, child] of prevEntries) {
            if (!this.childOrder.includes(key)) {
                child.abandoned();
                delete this.children[key];
            }
        }

        // Create presenters for those children which are not yet populated
        for (const entry of pageValue.entries) {
            if (!(entry.key in this.children)) {
                let type = await entry.element.call<string>('type');
                let child = await this.presenterForEntry(entry.key, type, entry.element);
                this.children[entry.key] = child;
            }
        }
    }

    async presenterForEntry(key: number, type: string, element: Proxy): Promise<ElementPresenter> {
        switch(type) {
            case 'Text':
                return this.make(TextPresenter, {...this.def(key), subject: element});
            case 'Page':
                return this.make(PagePresenter, {...this.def(key), subject: element});
            default:
                return this.make(UnknownPresenter, {...this.def(key), subject: element});
        }
    }

    abandoned() {
        if (this.children != null)
            for (const child of Object.values(this.children))
                child.abandoned();
        
        super.abandoned()
    }
}

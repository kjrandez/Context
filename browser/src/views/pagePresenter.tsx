import React, { ReactElement } from 'react';
import { Proxy } from '../state';
import ElementPresenter from '../elementPresenter';
import UnknownPresenter from './unknownPresenter';
import TextPresenter from './textPresenter';
import PageView from './pageView';

type PageValue = {
    entries: {
        key: number,
        element: Proxy<any>
    }[];
    latestEntry: Proxy<any> | null;
}

export default class PagePresenter extends ElementPresenter
{
    children: {[_: string]: ElementPresenter} = {};
    childOrder: string[] | null = null;

    async load(): Promise<void> {
        let value: PageValue = await this.subject.call('value');
        await this.fetchChildren(value);
    }

    async onUpdate(value: PageValue): Promise<void> {
        await this.fetchChildren(value);
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

    private async fetchChildren(pageValue: PageValue): Promise<void> {
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

    async presenterForEntry(key: number, type: string, element: Proxy<any>): Promise<ElementPresenter> {
        switch(type) {
            case 'Text':
                return this.make(TextPresenter, {key: key, subject: element});
            case 'Page':
                return this.make(PagePresenter, {key: key, subject: element});
            default:
                return this.make(UnknownPresenter, {key: key, subject: element});
        }
    }

    abandoned() {
        if (this.children != null)
            for (const child of Object.values(this.children))
                child.abandoned();
        
        super.abandoned()
    }
}

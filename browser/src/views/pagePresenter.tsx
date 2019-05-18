import React, { ReactElement } from 'react';
import Proxy from '../proxy';
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

    orphaned() {
        if (this.children != null)
            for (const child of Object.values(this.children))
                child.orphaned();
        
        super.orphaned()
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

    async onLoad(): Promise<void> {
        await this.fetchChildren();
    }

    async onChange(subject: Proxy): Promise<void> {
        if (subject === this.element) {
            await this.fetchChildren();
        }

        if (this.childOrder != null) {
            for (const key of this.childOrder) {
                let child = this.children[key]
                if (child != null)
                    await child.onChange(subject);
            }
        }
    }

    private async fetchChildren(): Promise<void> {
        let pageValue: PageValue = await this.element.call('value');

        // Object.entries has trouble with number-keyed objects in Typescript
        this.childOrder = pageValue.entries.map(X => X.key.toString());

        // Remove the entries which are no longer part of the page's value
        let prevEntries = Object.entries(this.children);
        for (const [key, child] of prevEntries) {
            if (!this.childOrder.includes(key)) {
                child.orphaned();
                delete this.children[key];
            }
        }

        // Create presenters for those children which are not yet populated
        for (const entry of pageValue.entries) {
            if (!(entry.key in this.children)) {
                let type = await entry.element.call<string>('type');
                let child = this.presenterForEntry(entry.key, type, entry.element);
                await child.onLoad();
                this.children[entry.key] = child;
            }
        }
    }

    presenterForEntry(key: number, type: string, element: Proxy): ElementPresenter {
        switch(type) {
            case 'Text': return new TextPresenter(this.path, key, element);
            case 'Page': return new PagePresenter(this.path, key, element);
            default: return new UnknownPresenter(this.path, key, element);
        }
    }
}

import ElementPresenter from '../elementPresenter';
import React, { ReactElement } from 'react';
import Proxy from '../proxy';
import UnknownView from './unknownView';

export default class UnknownPresenter extends ElementPresenter
{
    type: string | null = null;

    view(): ReactElement {
        if (this.type == null)
            return <div>Unknown element</div>
        else
            return <UnknownView key={this.key} type={this.type} />
    }

    async onLoad(): Promise<void> {
        this.type = await this.element.call('type');
    }

    async onChange(subject: Proxy): Promise<void> {
        if (subject === this.element) {
            this.type = await this.element.call('type');
        }
    }
}

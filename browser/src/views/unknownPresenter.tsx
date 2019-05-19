import ElementPresenter from '../elementPresenter';
import React, { ReactElement } from 'react';
import { Proxy } from '../state';
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
        this.type = await this.subject.call('type');
    }

    async onUpdate(_: Proxy): Promise<void> {
        this.type = await this.subject.call('type');
    }
}

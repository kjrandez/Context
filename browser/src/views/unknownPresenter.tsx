import { Model } from "../interfaces";
import ElementPresenter from './elementPresenter';
import React, { ReactElement } from 'react';
import Proxy from '../proxy';
import UnknownView from './unknownView';

export default class UnknownPresenter extends ElementPresenter
{
    // Async loaded
    type: string | null = null;

    view(): ReactElement {
        if (this.type == null)
            return <div>Unknown element</div>
        else
            return <UnknownView key={this.key} type={this.type} />
    }

    async fetch(): Promise<void> {
        this.type = await this.element.call('type');
    }

    async modelChanged(object: Proxy, model: Model<any>): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

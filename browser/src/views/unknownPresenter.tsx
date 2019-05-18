import { Model } from "../interfaces";
import ElementPresenter from './elementPresenter';
import React, { ReactElement } from 'react';
import Proxy from '../proxy';

export default class UnknownPresenter extends ElementPresenter
{
    // Async loaded
    type: string | null = null;

    view(): ReactElement {
        if (this.type == null)
            return <div>Unknown element</div>
        else
            return <div>Unknown element: {this.type}</div>
    }

    async fetch(): Promise<void> {
        this.type = await this.element.call('type');
    }

    async modelChanged(object: Proxy, model: Model): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

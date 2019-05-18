import { Model } from "../interfaces";
import ElementPresenter from './elementPresenter';
import React, { ReactElement } from 'react';
import Proxy from '../proxy';
import TextView from './textView';

type TextValue = {
    content: string;
}


export default class TextPresenter extends ElementPresenter
{
    // Async loaded
    content: string | null = null;

    view(): ReactElement {
        if (this.content == null)
            return <div>Unloaded Text Element</div>
        else
            return <TextView key={this.key} content={this.content} />
    }

    async fetch(): Promise<void> {
        let value = await this.element.call<TextValue>('value');
        this.content = value.content;
    }

    async modelChanged(object: Proxy, model: Model<TextValue>): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

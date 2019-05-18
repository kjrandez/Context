import { Model } from "../interfaces";
import ElementPresenter from './elementPresenter';
import React, { ReactElement } from 'react';
import Proxy from '../proxy';

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
            return <div>Text: {this.content}</div>
    }

    async fetch(): Promise<void> {
        let value: TextValue = await this.element.call('value');
        this.content = value.content;
    }

    async modelChanged(object: Proxy, model: Model): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

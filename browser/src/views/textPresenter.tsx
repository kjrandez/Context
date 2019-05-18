import ElementPresenter from '../elementPresenter';
import React, { ReactElement } from 'react';
import Proxy from '../proxy';
import TextView from './textView';

type TextValue = {
    content: string;
}

export default class TextPresenter extends ElementPresenter
{
    value: TextValue | null = null;

    view(): ReactElement {
        if (this.value == null)
            return <div>Unloaded Text Element</div>
        else
            return <TextView key={this.key} content={this.value.content} />
    }

    async onLoad(): Promise<void> {
        this.value = await this.element.call<TextValue>('value');
    }

    async onChange(subject: Proxy): Promise<void> {
        if (subject === this.element) {
            this.value = await this.element.call<TextValue>('value');
        }
    }
}
 
import ElementPresenter from './elementPresenter';
import React, { ReactElement } from 'react';
import TextView from './textView';

type TextValue = {
    content: string;
}

export default class TextPresenter extends ElementPresenter
{
    value: TextValue | null = null;
    selected = false;
    
    async load(): Promise<void> {
        this.value = await this.subject.call<TextValue>('value');
    }

    async onUpdate(value: TextValue): Promise<void> {
        this.value = value;
    }

    viewElement(): ReactElement {
        if (this.value == null)
            return <div>Unloaded Text Element</div>
        else
            return <TextView content={this.value.content} />
    }
}

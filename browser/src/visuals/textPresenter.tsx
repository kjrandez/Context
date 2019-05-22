import React, { ReactElement } from 'react';
import TextView from './textView';
import ElementPresenter, { ElementPresenterArgs } from '../elementPresenter';
import { Proxy } from '../state';

type TextValue = {
    content: string;
}

export default class TextPresenter extends ElementPresenter
{
    value: TextValue | null = null;
    selected = false;
    subject: Proxy<TextValue>;

    constructor(args: ElementPresenterArgs) {
        super(args);
        this.subject = args.subject;
    }

    subscriptionsAsync() { return [this.subject]; }

    async stateChangedAsync(): Promise<void> {
        this.value = await this.subject.call<TextValue>('value');
    }

    viewElement(): ReactElement {
        if (this.value == null)
            return <div>Unloaded Text Element</div>
        else
            return <TextView content={this.value.content} />
    }

    abandoned() {
        this.subject.detachAsync(this.path);
    }
}

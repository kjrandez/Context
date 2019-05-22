import React, { ReactElement } from 'react';
import TextView from './textView';
import ASpecializedPresenter, { ASpecializedPresenterArgs } from '../specializedPresenter';
import { Proxy } from '../state';

type TextValue = {
    content: string;
}

export default class TextPresenter extends ASpecializedPresenter
{
    value: TextValue | null = null;
    selected = false;
    subject: Proxy<TextValue>;

    constructor(args: ASpecializedPresenterArgs) {
        super(args);
        this.subject = args.subject;
    }

    subscriptionsAsync() { return [this.subject]; }

    async updateAsync(): Promise<void> {
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

import React, { ReactElement } from 'react';
import TextView from './textView';
import ASpecializedPresenter, { ASpecializedPresenterArgs } from '../specializedPresenter';
import { Proxy } from '../state';
import { Attacher, AsyncAttacher } from '../presenter';

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

    async init(async: Attacher, attachAsync: AsyncAttacher): Promise<void> {
        attachAsync(this.subject, this.onUpdate.bind(this));
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

    abandoned() {
        this.subject.detachAsync(this.path);
    }
}

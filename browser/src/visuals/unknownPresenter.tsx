import React, { ReactElement } from 'react';
import UnknownView from './unknownView';
import ASpecializedPresenter, { ASpecializedPresenterArgs } from '../specializedPresenter';
import { Proxy } from '../state';

export default class UnknownPresenter extends ASpecializedPresenter
{
    subject: Proxy<any>;
    type: string | null = null;

    constructor(args: ASpecializedPresenterArgs) {
        super(args);
        this.subject = args.subject;
    }

    async init(): Promise<void> {
        this.type = await this.subject.call('type');
    }

    viewElement(): ReactElement {
        if (this.type == null)
            return <div>Unknown element</div>
        else
            return <UnknownView key={this.key} type={this.type} />
    }
}

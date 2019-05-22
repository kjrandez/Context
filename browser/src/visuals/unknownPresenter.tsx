import React, { ReactElement } from 'react';
import UnknownView from './unknownView';
import ElementPresenter, { ElementPresenterArgs } from '../elementPresenter';
import { Proxy } from '../state';

export default class UnknownPresenter extends ElementPresenter
{
    subject: Proxy<any>;
    type: string | null = null;

    constructor(args: ElementPresenterArgs) {
        super(args);
        this.subject = args.subject;
    }

    async stateChangedAsync(): Promise<void> {
        this.type = await this.subject.call('type');
    }

    viewElement(): ReactElement {
        if (this.type == null)
            return <div>Unknown element</div>
        else
            return <UnknownView key={this.key} type={this.type} />
    }
}

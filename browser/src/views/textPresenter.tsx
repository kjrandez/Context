import ElementPresenter from '../elementPresenter';
import React, { ReactElement } from 'react';
import { Proxy } from '../state';
import TextView from './textView';
import Presenter from '../presenter';

type TextValue = {
    content: string;
}

export default class TextPresenter extends ElementPresenter
{
    value: TextValue | null = null;
    selected = false;

    view(): ReactElement {
        if (this.value == null)
            return <div>Unloaded Text Element</div>
        else
            return <TextView
                selected={this.selected}
                content={this.value.content}
                onClick={this.onClick.bind(this)} />
    }

    onClick(): void {

        this.state.elementClicked(this, false);
    }

    selectionChanged(selection: Presenter[]) {
        if (selection.includes(this))
            this.selected = true;
        else   
            this.selected = false;
    }

    async onLoad(): Promise<void> {
        this.state.selection.attach(this.path, this.selectionChanged.bind(this))

        this.value = await this.element.call<TextValue>('value');
    }

    async onUpdate(_: Proxy): Promise<void> {
        this.value = await this.element.call<TextValue>('value');
    }
}

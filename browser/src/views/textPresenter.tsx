import ElementPresenter from '../elementPresenter';
import React, { ReactElement } from 'react';
import TextView from './textView';
import { Presenter } from '../presenter';

type TextValue = {
    content: string;
}

export default class TextPresenter extends ElementPresenter
{
    value: TextValue | null = null;
    selected = false;
    
    async load(): Promise<void> {
        this.state.selection.attach(this.path, this.selectionChanged.bind(this))
        this.value = await this.subject.call<TextValue>('value');
    }

    async onUpdate(value: TextValue): Promise<void> {
        this.value = value;
    }

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
}

import React from 'react';
import { AsyncPresenter, AsyncPresenterArgs } from "../presenter";
import { Proxy } from "../state";
import TileView from './tileView';
import TextPresenter from './textPresenter';
import PagePresenter from './pagePresenter';
import UnknownPresenter from './unknownPresenter';
import ElementPresenter, { ElementPresenterArgs } from '../elementPresenter';
import { makeAsync } from '../presenter';

export interface TilePresenterArgs extends AsyncPresenterArgs { subject: Proxy<any> };

export default class TilePresenter extends AsyncPresenter
{
    selected: boolean = false;
    subject: Proxy<any>;
    currentRef: HTMLDivElement | null = null;

    constructor(args: TilePresenterArgs) {
        super(args);
        this.subject = args.subject;
    }

    subscriptions() { return [this.state.selection]; }

    stateChanged() {
        let selection = this.state.selection.get();
        if (selection.includes(this))
            this.selected = true;
        else   
            this.selected = false;
    }

    async stateChangedAsync() {
        this.removeChildIfPresent("specialized");
        let specialized = await this.specializedPresenter(this.key, this.subject);
        this.addChild(specialized);
    }

    onMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        event.stopPropagation();
        this.state.elementClicked(this, event.ctrlKey);
    }

    setRefNode(node: HTMLDivElement | null) {
        this.currentRef = node;
    }

    viewElement() {
        return(
            <TileView
                selected={this.selected}
                onMouseDown={this.onMouseDown.bind(this)}
                setRefNode={this.setRefNode.bind(this)}
                content={this.content()} />
        );
    }

    async specializedPresenter(key: string, subject: Proxy<any>)  {
        let type = await subject.call<string>('type');

        var cons: new (_: ElementPresenterArgs) => ElementPresenter;
        
        switch(type) {
            case 'Text': cons = TextPresenter; break;
            case 'Page': cons = PagePresenter; break;
            default: cons = UnknownPresenter; break;
        }

        return await makeAsync(cons, {...this.ccargs("specialized"), subject: subject});
    }
}

/* Major original callbacks:

    droppedAt(newPath, beforeKey) {
        // Remove this page entry from the parent
        var myPath = this.props.tag.path;
        var parentId = myPath[myPath.length - 1];
        var parent = this.props.app.store.fragment(parentId);
        parent.invoke("remove", [this.props.tag.key], true);

        // Get reference to the new parent page
        var newParentId = newPath[newPath.length - 1];
        var newParent = this.props.app.store.fragment(newParentId);

        // Allow selection to be grabbed when element is inserted
        this.props.app.setGrabPath(newPath);

        // Add this element to the new page before the given key or at the end
        if(beforeKey != null)
            newParent.invoke("insertBefore", [this.fragment, beforeKey, true], true);
        else
            newParent.invoke("append", [this.fragment, true], true);
        
        // Keep this element invisible while background operations are occurring
        this.setState({ hide: true });
    }
*/

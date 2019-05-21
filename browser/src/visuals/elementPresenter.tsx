import React from 'react';
import { AsyncPresenter, AsyncPresenterArgs, Attacher } from "../presenter";
import { Proxy } from "../state";
import ElementView from './elementView';
import { Presenter } from '../presenter';
import TextPresenter from './textPresenter';
import PagePresenter from './pagePresenter';
import UnknownPresenter from './unknownPresenter';
import ASpecializedPresenter, { ASpecializedPresenterArgs } from '../specializedPresenter';

export interface ElementPresenterArgs extends AsyncPresenterArgs { subject: Proxy<any> };

export default class ElementPresenter extends AsyncPresenter
{
    selected: boolean = false;
    subject: Proxy<any>;
    currentRef: HTMLDivElement | null = null;
    specialized: ASpecializedPresenter | null = null;

    constructor(args: ElementPresenterArgs) {
        super(args);
        this.subject = args.subject;
    }

    init(attach: Attacher) {
        attach(this.state.selection, this.selectionChanged.bind(this));
    }

    async initAsync(): Promise<void> {
        this.specialized = await this.specializedPresenter(this.key, this.subject);
    }

    onMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        event.stopPropagation();
        this.state.elementClicked(this, event.ctrlKey);
    }

    selectionChanged(selection: Presenter[]) {
        if (selection.includes(this))
            this.selected = true;
        else   
            this.selected = false;
    }

    setRefNode(node: HTMLDivElement | null) {
        this.currentRef = node;
    }

    viewElement() {
        if(this.specialized == null)
            return <div>Nothing loaded</div>

        return(
            <ElementView
                selected={this.selected}
                onMouseDown={this.onMouseDown.bind(this)}
                setRefNode={this.setRefNode.bind(this)}>

                {this.specialized.view()}

            </ElementView>
        );
    }

    async specializedPresenter(key: number, subject: Proxy<any>)  {
        let type = await subject.call<string>('type');

        var cons: new (_: ASpecializedPresenterArgs) => ASpecializedPresenter;
        
        switch(type) {
            case 'Text': cons = TextPresenter; break;
            case 'Page': cons = PagePresenter; break;
            default: cons = UnknownPresenter; break;
        }

        return await this.make(cons, {...this.ccargs(key), subject: subject});
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

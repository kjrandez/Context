import React, { ReactElement } from 'react';
import { AsyncPresenter, AsyncPresenterArgs } from "../presenter";
import { Proxy } from "../state";
import { AppState } from "../app";
import ElementView from './elementView';

export interface ElementPresenterArgs extends AsyncPresenterArgs { subject: Proxy<any> };

export default abstract class ElementPresenter extends AsyncPresenter
{
    subject: Proxy<any>;
    currentRef: HTMLDivElement | null = null;

    constructor(state: AppState, parentPath: AsyncPresenter[], args: ElementPresenterArgs) {
        super(state, parentPath, args);
        this.subject = args.subject;
        this.subject.attachAsync(this.path, this.onUpdate.bind(this));
    }

    onMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        event.stopPropagation();
        //this.props.app.selected(this.uniqueSelection, event.ctrlKey);
    }

    setRefNode(node: HTMLDivElement | null) {
        //this.uniqueSelection.ref.current = node;
        this.currentRef = node;
    }

    wrappedViewElement(viewElement: ReactElement) {
        return super.wrappedViewElement(
            <ElementView
                selected={false}
                hide={false}
                isDragging={false}
                isOver={false}
                onMouseDown={this.onMouseDown.bind(this)}
                setRefNode={this.setRefNode.bind(this)}>

                {viewElement}
                
            </ElementView>
        );
    }

    abandoned() {
        this.subject.detach(this.path);
    }

    // Update state asynchronously when a foreign object updates
    abstract async onUpdate(value: any): Promise<void>;
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

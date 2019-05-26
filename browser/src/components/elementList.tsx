import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ViewState from '../state/viewState';
import { PageEntry, TextValue, ElementModel } from '../models';
import { Proxy } from '../client';

interface ElementListProps {
    viewState: ViewState;
    entries: PageEntry[];
}

@observer
class Text extends Component<{viewState: ViewState, element: Proxy<any>}>
{
    render() {
        const value: TextValue = this.props.viewState.models[this.props.element.id].value;
        return <div>Text Element: {value.content}</div>
    }
}

class Unknown extends Component<{viewState: ViewState, element: Proxy<any>}>
{
    render() {
        return <div>Unknown Element</div>
    }
}

@observer
export default class ElementList extends Component<ElementListProps>
{
    elementForEntry(entry: PageEntry) {
        let ViewType: typeof Unknown | typeof Text;
        let elementType = this.props.viewState.models[entry.element.id].type;

        switch(elementType) {
            case "Text": ViewType = Text; break;
            default: ViewType = Unknown;
        }

        return <ViewType key={entry.key} viewState={this.props.viewState} element={entry.element} />
    }

    render() {
        return(
            <>
                {this.props.entries.map(entry => this.elementForEntry(entry))}
            </>
        )
    }
}

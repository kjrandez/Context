import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ViewState, { NestedPage } from '../state/viewState';
import { PageEntry, TextValue, ElementModel, PageValue } from '../state/models';
import { Proxy } from '../client';

interface ElementListProps {
    viewState: ViewState;
    entries: PageEntry[];
    pagePath: number[];
}

interface ElementProps {
    viewState: ViewState;
    element: Proxy<any>;
    path: number[];
}

@observer
class Text extends Component<ElementProps>
{
    render() {
        const value: TextValue = this.props.viewState.models[this.props.element.id].value;
        return <div>Text Element: {value.content}</div>
    }
}

@observer
class Page extends Component<ElementProps>
{
    nestedPage() {
        var subpages = this.props.viewState.subpages;
        var nestedPage = null;
        for (const key of this.props.path) {
            nestedPage = subpages[key];
            subpages = nestedPage.subpages;
        }

        return nestedPage;
    }

    expand(nestedPage: NestedPage) {
        this.props.viewState.pageExpanded(nestedPage);
    }

    render() {
        let id = this.props.element.id;
        let value = this.props.viewState.models[id].value as PageValue;
        let nestedPage = this.nestedPage();

        if (nestedPage == null)
            return <></>

        if (nestedPage.expanded) {
            return(
                <div style={{marginLeft: '20px'}}>
                    <ElementList
                    viewState={this.props.viewState}
                    entries={value.entries}
                    pagePath={this.props.path} />
                </div>
            );
        }
        else {
            return(
                <div>
                    Nested Page
                    <button onClick={() => this.expand(nestedPage as NestedPage)}>
                        Expand
                    </button>
                </div>
            )
        }
    }
}

class Unknown extends Component<ElementProps>
{
    render() {
        return <div>Unknown Element</div>
    }
}

@observer
export default class ElementList extends Component<ElementListProps>
{
    elementForEntry(entry: PageEntry) {
        let ViewType: typeof Unknown | typeof Text | typeof Page;
        let elementType = this.props.viewState.models[entry.element.id].type;

        switch(elementType) {
            case "Text": ViewType = Text; break;
            case "Page": ViewType = Page; break;
            default: ViewType = Unknown;
        }

        return <ViewType 
            key={entry.key}
            viewState={this.props.viewState}
            element={entry.element}
            path={[...this.props.pagePath, entry.key]} />
    }

    render() {
        return(
            <>
                {this.props.entries.map(entry => this.elementForEntry(entry))}
            </>
        )
    }
}

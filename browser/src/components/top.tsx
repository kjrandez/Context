import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ViewState from '../state/viewState';
import ElementList from './elementList';
import { ElementModel, PageValue } from '../state/models';
import { Proxy } from '../client';

interface TopProps {
    viewState: ViewState
}

@observer export default class Top extends Component<TopProps>
{
    onMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {

    }

    render() {
        let sidePanel = <></>;
        let pageHeader = <></>;
        let toolbar = <></>;

        return( 
            <div id="scene" onMouseDown={(event) => this.onMouseDown(event)}>
                <div id="left-column">
                    {sidePanel}
                </div>
                <div id="center-column">
                    <div id="page">
                        <div id="top-spacer"></div>
                        {pageHeader}
                        <div id="page-elements">
                            {this.renderPageElements()}
                        </div>
                        <div id="bottom-spacer"></div>
                    </div>
                </div>
                <div id="right-column">
                    {toolbar}
                </div>
            </div>
        )
    }

    renderPageElements() {
        let topPage = this.props.viewState.topPage;
        if (topPage == null)
            return <></>

        let topPageModel: ElementModel = this.props.viewState.models[topPage.id];
        let topPageEntries = topPageModel.value.entries;
        
        return <ElementList
            viewState={this.props.viewState}
            entries={topPageEntries}
            pagePath={[]} />
    }
}

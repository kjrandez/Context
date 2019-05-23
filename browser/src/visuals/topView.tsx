import React, { Component, ReactElement } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

interface TopProps {
    onMouseDown: () => void,
    content: {[_: string]: ReactElement}
}

class TopView extends Component<TopProps>
{
    render(): ReactElement {
        let sidePanel = this.props.content.sidePanel;
        let pageHeader = this.props.content.pageHeader;
        let page = this.props.content.page;
        let toolbar = this.props.content.toolbar;

        return (
            <div id="scene" onMouseDown={this.props.onMouseDown}>
                <div id="left-column">
                    {sidePanel}
                </div>
                <div id="center-column">
                    <div id="page">
                        <div id="top-spacer"></div>
                        {pageHeader}
                        <div id="page-elements">
                            {page}
                        </div>
                        <div id="bottom-spacer"></div>
                    </div>
                </div>
                <div id="right-column">
                    {toolbar}
                </div>
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(TopView);

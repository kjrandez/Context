import React, { Component, ReactElement } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

interface TopProps {
    onMouseDown: () => void,
    sidePanelContent: ReactElement,
    pageHeader: ReactElement,
    pageContent: ReactElement,
    toolbarContent: ReactElement
}

class TopView extends Component<TopProps>
{
    render(): ReactElement {
        return (
            <div id="scene" onMouseDown={this.props.onMouseDown}>
                <div id="left-column">
                    {this.props.sidePanelContent}
                </div>
                <div id="center-column">
                    <div id="page">
                        <div id="top-spacer"></div>
                        {this.props.pageHeader}
                        <div id="page-elements">
                            {this.props.pageContent}
                        </div>
                        <div id="bottom-spacer"></div>
                    </div>
                </div>
                <div id="right-column">
                    {this.props.toolbarContent}
                </div>
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(TopView);

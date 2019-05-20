import React, { CSSProperties, Component, ReactElement } from 'react';

interface TextProps {
    content: string;
    selected: boolean;
    onClick: () => void;
}

export default class UnknownView extends Component<TextProps>
{
    render(): ReactElement {
        let style: CSSProperties = {};
        if (this.props.selected) {
            style.color = 'white';
            style.backgroundColor = 'blue';
        }
        
        return <div style={style} onMouseDown={this.props.onClick}>Text: {this.props.content}</div>
    }
}

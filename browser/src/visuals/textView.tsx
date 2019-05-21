import React, { Component, ReactElement } from 'react';

interface TextProps {
    content: string;
}

export default class UnknownView extends Component<TextProps>
{
    render(): ReactElement {
        return <div>Text: {this.props.content}</div>
    }
}

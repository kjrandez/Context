import React, { Component, ReactElement } from 'react';

interface UnknownProps {
    type: string;
}

export default class UnknownView extends React.Component<UnknownProps>
{
    render(): ReactElement {
        return <div>Unknown element: {this.props.type}</div>
    }
}

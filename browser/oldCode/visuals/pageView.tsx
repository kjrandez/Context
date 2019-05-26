import React, { ReactElement } from 'react';

interface PageProps {
    title: string;
    order: string[];
    content: {[_: string]: ReactElement};
}

export default class UnknownView extends React.Component<PageProps>
{
    render(): ReactElement {
        let content = this.props.order.map(key => this.props.content[key]);

        return(
            <div>
                <div>{this.props.title}</div>
                <div style={{marginLeft: '20px'}}>{content}</div>
            </div>
        );
    }
}

import React, { ReactElement } from 'react';

interface PageProps {
    title: string;
    content: ReactElement[];
}

export default class UnknownView extends React.Component<PageProps>
{
    render(): ReactElement {
        return(
            <div>
                <div>{this.props.title}</div>
                <div style={{marginLeft: '20px'}}>{this.props.content}</div>
            </div>
        );
    }
}

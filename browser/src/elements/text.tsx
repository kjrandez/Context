import React, {Component, ReactElement} from 'react';
import {ElementProps} from '.';
import {TextValue} from '../types';

interface TextProps extends ElementProps { value: TextValue }

export default class Text extends Component<TextProps>
{
    render(): ReactElement {
        let {content} = this.props.value;
        
        return <div contentEditable={true}>{content}</div>
    }
}

export class Script extends Component<TextProps>
{
    render() {
        return <span className="script-text"><Text {...this.props} /></span>;
    }
}

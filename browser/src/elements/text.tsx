import React, {Component, ReactElement} from 'react';
import {ElementProps} from '.';
import {Model, TextValue} from '../types';

interface TextProps extends ElementProps { model: Model<TextValue> }

export default class Text extends Component<ElementProps>
{
    render(): ReactElement {
        let {value: {content}} = this.props.model;
        
        return <p>Text [{this.props.model.id}]: {content} </p>
    }
}

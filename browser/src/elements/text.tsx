import React, {Component, ReactElement} from 'react';
import {ElementProps} from '.';
import {TextModel} from '../types';


export default class Text extends Component<ElementProps>
{
    render(): ReactElement {
        let model = this.props.store.db[this.props.eid] as TextModel;
        
        return <p>Text: {model.text} </p>
    }
}

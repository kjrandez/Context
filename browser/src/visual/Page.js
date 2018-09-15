import React, {Component} from 'react';
import {elementList} from './shared.js';

export default class Page extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            content: props.fragment.value()
        }
    }

    modelChanged() {
        this.setState({
            content: this.props.fragment.value()
        });
    }

    render() {
        return (
            <div className="element">
                {elementList(this.state.content)}
            </div>
        );
    }

    componentDidMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect();
    }
}

import React, {Component} from 'react';
import Element from './Element.js';

export default class Text extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            text: props.fragment.value()
        }
    }

    onChange(event) {
        this.props.fragment.event({
            transaction: "update",
            value: event.target.value
        });
    }

    modelChanged() {
        this.setState({
            text: this.props.fragment.value()
        });
    }

    render() {
        return (
            <Element
                fragment={this.props.fragment}
                selection={this.props.selection}
                app={this.props.app}>
                <textarea
                    onChange={(event) => this.onChange(event)}
                    value={this.state.text} />
            </Element>
        );
    }

    componentDidMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect();
    }
}

import React, {Component} from 'react';
import Element from './Element.js';

export default class Image extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            src: props.fragment.value()
        }
    }

    modelChanged() {
        this.setState({
            src: this.props.fragment.value(),
            alt: this.props.fragment.meta().alt
        });
    }

    render() {
        return (
            <Element
                fragment={this.props.fragment}
                selection={this.props.selection}
                app={this.props.app}>
                <img src={this.state.src} alt={this.state.alt} />
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
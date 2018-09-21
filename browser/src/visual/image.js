import React, {Component} from 'react';
import Element from './element.js';

export default class Image extends Component
{
    constructor(props) {
        super(props);

        var value = this.props.fragment.value();

        this.state = {
            src: value.src,
            alt: value.alt
        }
    }

    modelChanged() {
        var value = this.props.fragment.value();

        this.setState({
            src: value.src,
            alt: value.alt
        });
    }

    render() {
        return (
            <Element
                path={this.props.path}
                index={this.props.index}
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
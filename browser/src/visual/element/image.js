import React, {Component} from 'react';

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
            <img src={this.state.src} alt={this.state.alt} />
        );
    }

    componentWillMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect(this);
    }
}
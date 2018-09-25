import React, {Component} from 'react';

export default class Link extends Component
{
    constructor(props) {
        super(props);

        var value = this.props.fragment.value();
        this.state = {
            href: value.href
        }
    }

    modelChanged() {
        var value = this.props.fragment.value();

        this.setState({
            href: value.href
        });
    }

    render() {
        return (
            <a href={this.state.href}>{this.state.href}</a>
        );
    }

    componentWillMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect(this);
    }
}

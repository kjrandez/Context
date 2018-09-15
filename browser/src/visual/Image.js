import React, {Component} from 'react';

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
            <div className="element">
                <img src={this.state.src} alt={this.state.alt} />
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
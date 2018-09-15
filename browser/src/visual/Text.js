import React, {Component} from 'react';

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
            <div className="element">
                <textarea
                    onChange={(event) => this.onChange(event)}
                    value={this.state.text} />
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

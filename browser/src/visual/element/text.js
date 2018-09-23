import React, {Component} from 'react';
import Textarea from 'react-textarea-autosize';
import Element from './element.js';

export default class Text extends Component
{
    constructor(props) {
        super(props);

        var value = this.props.fragment.value();

        this.state = {
            content: value.content
        }
    }

    onChange(event) {
        this.props.fragment.invoke({
            selector: "update",
            arguments: [event.target.value]
        });
    }

    modelChanged() {
        var value = this.props.fragment.value();

        this.setState({
            content: value.content
        });
    }

    render() {
        return (
            <Element
                fragment={this.props.fragment}
                loc={this.props.loc}
                selection={this.props.selection}
                app={this.props.app}>
                <Textarea
                    className="text-edit"
                    onChange={(event) => this.onChange(event)}
                    value={this.state.content} />
            </Element>
        );
    }

    componentWillMount() {
        this.props.fragment.connect(this);
    }

    componentWillUnmount() {
        this.props.fragment.disconnect(this);
    }
}

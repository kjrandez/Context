import React, { Component } from 'react';

export default class PageHeader extends Component
{
    constructor(props) {
        super(props);

        var titleElement = this.getTitleElement();
        this.state = {
            titleElement: titleElement,
            title: (titleElement != null) ? titleElement.value().content : null
        };
    }

    getTitleElement() {
        var value = this.props.fragment.value();
        var titleElement = null;

        if(value.content.length > 1) {
            // Only show title if there are at least 2 elements
            var firstEntryId = value.content[0].element;
            var firstElement = this.props.app.store.fragment(firstEntryId);

            if(firstElement.type() === "Text")
                titleElement = firstElement
        }

        return titleElement;
    }

    componentWillMount() {
        this.props.fragment.connect(this);
        if(this.state.titleElement != null)
            this.state.titleElement.connect(this);
    }

    componentWillUnmount() {
        if(this.state.titleElement != null)
            this.state.titleElement.disconnect(this);
        this.props.fragment.disconnect(this);
    }

    modelChanged(updatedFragment) {
        if(updatedFragment === this.state.titleElement) {
            this.setState({ title: updatedFragment.value().content });
        }
        else {
            var titleElement = this.getTitleElement();

            if(titleElement !== this.state.titleElement) {
                if(this.state.titleElement != null)
                    this.state.titleElement.disconnect(this);
                titleElement.connect(this);

                this.setState({
                    titleElement: titleElement,
                    title: (titleElement != null) ? titleElement.value().content : null
                });
            }
            
        }
    }   

    render() {
        if(this.state.titleElement == null)
            return <div className="page-header-rule"></div>
        return <p className="page-header">{this.state.title}</p>
    }
}
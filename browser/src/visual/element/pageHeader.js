import React, { Component } from 'react';

export default class PageHeader extends Component
{
    constructor(props) {
        super(props);

        /*var titleElement = this.getTitleElement();
        this.state = {
            titleElement: titleElement,
            title: (titleElement != null) ? titleElement.value().content : null,
            mouseOver: false,
            shiftDown: false,
            ctrlDown: false
        };*/
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

    /*componentWillMount() {
        this.props.fragment.connect(this);
        if(this.state.titleElement != null)
            this.state.titleElement.connect(this);
        this.props.app.connectKeyListener(this);
    }

    componentWillUnmount() {
        if(this.state.titleElement != null)
            this.state.titleElement.disconnect(this);
        this.props.fragment.disconnect(this);
        this.props.app.disconnectKeyListener(this);
    }*/

    shiftKey(down) {
        this.setState({
            shiftDown: down
        });
    }

    ctrlKey(down) {
        this.setState({
            ctrlDown: down
        })
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

    onClick(event) {
        // Prevent default shift-click behavior (new window)
        if(this.state.shiftDown) {
            event.preventDefault();

            // Set new top page to this one
            this.props.app.enterPage(this.props.path, this.props.fragment.id());
        }
    }

    pathHash() {
        var hash = "#";
        this.props.path.forEach(id => {hash += (id + ",")});
        hash += this.props.fragment.id();
        return hash;
    }

    pageHeaderClass() {
        if(this.state.shiftDown || this.state.ctrlDown)
            return "page-header link";
        return "page-header";
    }

    pageHeaderLabel() {
        if(this.state.shiftDown || this.state.ctrlDown)
            return <a href={this.pathHash()} onClick={ev => this.onClick(ev)}>{this.state.title}</a>;
        return this.state.title;
    }

    render() {
        //if(this.state.titleElement == null)
            return <div className="page-header-rule"></div>
        //return <p className={this.pageHeaderClass()}>
        //    {this.pageHeaderLabel()}
        //</p>
    }
}
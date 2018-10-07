import React, { Component } from 'react';

export default class PageHeader extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            title: null,
            shiftDown: false,
            ctrlDown: false
        };
        this.first = null;
    }

    setupForProps(props) {
        var prev = this.first;

        if(props.value.content.length > 1) {
            var firstId = props.value.content[0].element;
            this.first = props.app.store.fragment(firstId);
        }
        
        if(this.first != prev) {
            if(prev != null)
                prev.detach(this);
            if(this.first != null)
                this.first.attach(this, (val, type) => this.firstModelValue(val, type));
        }
    }

    componentWillMount() {
        this.setupForProps(this.props);
        this.props.app.connectKeyListener(this);
    }

    componentWillReceiveProps(props) {
        this.setupForProps(props);
    }

    componentWillUnmount() {
        if(this.first != null)
            this.first.detach(this);
        this.props.app.disconnectKeyListener(this);
    }

    firstModelValue(value, type) {
        if(type == "Text")
            this.setState({ title: value.content });
        else
            this.setState({ title: null });
    }

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

    onClick(event) {
        // Prevent default shift-click behavior (new window)
        if(this.state.shiftDown) {
            event.preventDefault();

            // Set new top page to this one
            this.props.app.enterPage(this.props.tag.path, this.props.tag.id);
        }
    }

    pathHash() {
        var hash = "#";
        this.props.tag.path.forEach(id => {hash += (id + ",")});
        hash += this.props.tag.id;
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
        if(this.state.title == null)
            return <div className="page-header-rule"></div>

        return(
            <p className={this.pageHeaderClass()}>
                {this.pageHeaderLabel()}
            </p>
        );
    }
}
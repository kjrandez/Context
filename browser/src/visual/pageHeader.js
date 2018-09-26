import React, { Component } from 'react';
import { Icon, Position, MenuItem, Menu, OverflowList, Boundary, Popover } from '@blueprintjs/core';

export default class PageHeader extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            items: this.getItems(props.pathFragments)
        }
    }

    getItems(fragments) {
        var href = "#";
        var target = [fragments[0].id()];

        if(fragments.length === 1)
            return [{ target: target, href: href, icon: "symbol-diamond", text: "Root" }];

        var results = [{ target: target, href: href, icon: null, text: "Root" }]
        
        results = results.concat(fragments.slice(1).map((fragment, index) => {
            if(index === 0)
                href += fragment.id();
            else
                href += "," + fragment.id();
            target = target.concat([fragment.id()]);

            if(index === fragments.length - 2)
                return { target: target, href: href, icon: "symbol-diamond", text: "" };
            
            var untitled = { target: target, href: href, icon: "document", text: "" }

            var content = fragment.value().content;
            if(content.length < 1)
                return untitled;

            var firstEntry = this.props.app.store.fragment(content[0].element);
            if(firstEntry.type() !== "Text")
                return untitled;

            return { target: target, href: href, icon: null, text: firstEntry.value().content };
        }));

        return results;
    }

    modelChanged() {
    }

    componentWillReceiveProps(nextProps) {
        this.disconnectFromPathFragments(this.props.pathFragments);
        this.connectToPathFragments(nextProps.pathFragments);

        this.setState({
            items: this.getItems(nextProps.pathFragments)
        });
    }

    componentWillMount() {
        this.connectToPathFragments(this.props.pathFragments);
    }

    componentWillUnmount() {
        this.disconnectFromPathFragments(this.props.pathFragments);
    }

    connectToPathFragments(fragments) {
        fragments.forEach(fragment => {
            fragment.connect(this);
        });
    }

    disconnectFromPathFragments(fragments) {
        fragments.forEach(fragment => {
            fragment.disconnect(this);
        });
    }

    items() {
        return this.state.titles.map((title, index) => {
            return { href: "#", icon: "folder-close", text: title }
        });
    }

    navigate(target) {
        if(target.length === 0) {
            this.props.app.enterRoot();
        }
        else {
            var path = target.slice();
            var pageId = path.pop();
            this.props.app.enterPage(path, pageId);
        }
    }

    renderBreadcrumb(props, index) {
        if(props.href != null) {
            var iconStyle = {position: "relative", top: "2px"};
            if(props.icon === "symbol-diamond")
                iconStyle = {position: "relative", marginRight: "5px", top: "2px"};
            return (
                <li key={index}>
                    <a onClick={() => this.navigate(props.target)} className="bp3-breadcrumb" href={props.href}>
                        <Icon icon={props.icon} style={iconStyle}/>
                        {props.text}
                    </a>
                </li>
            );
        }
        else {
            return (
                <li className="bp3-breadcrumb bp3-breadcrumb-current" key={index}>
                    {props.text}
                </li>
            );
        }
    }

    renderOverflow(items) {
        const position = Position.BOTTOM_LEFT;
        const orderedItems = items.slice().reverse();
        const menuItems = orderedItems.map((item, index) => 
            <MenuItem {...item} onClick={() => this.navigate(item.target)} key={index} />
        );
        return (
            <li>
                <Popover position={position}>
                    <span className="bp3-breadcrumbs-collapsed" />
                    <Menu>{menuItems}</Menu>
                </Popover>
            </li>
        );
    };

    onMouseDown(ev) {
        ev.stopPropagation();
    }

    render() {
        return <div className="header-breadcrumb" onMouseDown={ev => this.onMouseDown(ev)}><OverflowList
            className="bp3-breadcrumbs"
            collapseFrom={Boundary.START}
            items={this.state.items}
            overflowRenderer={this.renderOverflow.bind(this)}
            visibleItemRenderer={this.renderBreadcrumb.bind(this)}
        /></div>
    }
}

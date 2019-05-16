import React, { Component } from 'react';
import { Intent, Icon, Position, MenuItem, Menu, OverflowList, Boundary, Popover } from '@blueprintjs/core';

export default class Header extends Component
{
    getItems(fragments) {
        var href = "#" + fragments[0].id();
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
        /*this.disconnectFromPathFragments(this.props.pathFragments);
        this.connectToPathFragments(nextProps.pathFragments);

        this.setState({
            items: this.getItems(nextProps.pathFragments)
        });*/
    }

    componentWillMount() {
        //this.connectToPathFragments(this.props.pathFragments);
    }

    componentWillUnmount() {
        //this.disconnectFromPathFragments(this.props.pathFragments);
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
        return props;
        /*var iconStyle = {position: "relative", top: "2px"};
        var intent = Intent.NONE;
        if(props.icon === "symbol-diamond") {
            iconStyle = {position: "relative", marginRight: "5px", top: "2px"};
            intent = Intent.PRIMARY;
        }
        return (
            <li className="bp3-breadcrumb" key={index}>
                <a onClick={() => this.navigate(props.target)} className="bp3-breadcrumb" href={props.href}>
                    <Icon intent={intent} icon={props.icon} style={iconStyle}/>
                    {props.text}
                </a>
            </li>
        );*/
    }

    renderOverflow(items) {
        return <p>asdf</p>;
        /*const position = Position.BOTTOM_LEFT;
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
        );*/
    };

    onMouseDown(ev) {
        ev.stopPropagation();
    }

    rootHereEntry() {
        return <li>Root ()</li>;
    }

    rootEntry(entry) {
        return <li>Root</li>;
    }

    defaultEntry(entry) {
        return <li>Page</li>;
    }

    hereEntry() {
        return <li>()</li>;
    }

    headerItems() {
        var pathContent = this.props.pathContent;
        if(pathContent.length == 0)
            return [this.rootHereEntry()];
        
        var entries = this.props.pathContent.map((entry, i) => {
            if(i == 0)
                return this.rootEntry(entry);
            return this.defaultEntry(entry);
        });
        entries.push(this.hereEntry())
        return entries;
    }

    render() {
        return(
            <div className="header-breadcrumb" onMouseDown={ev => this.onMouseDown(ev)}>
                <OverflowList
                className="bp3-breadcrumbs"
                collapseFrom={Boundary.START}
                items={this.headerItems()}
                overflowRenderer={this.renderOverflow.bind(this)}
                visibleItemRenderer={this.renderBreadcrumb.bind(this)}/>
            </div>
        );
    }
}

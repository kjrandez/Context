import React, {Component} from 'react';

export default class Image extends Component
{
    constructor(props) {
        super(props);
        this.onDragStart = this.onDragStart.bind(this);
    }

    onDragStart(ev) {
        ev.preventDefault();
    }

    render() {
        const { src, alt } = this.props.value;
        return <img onDragStart={this.onDragStart} src={src} alt={alt} />
    }
}

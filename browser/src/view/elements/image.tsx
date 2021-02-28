import React, { Component, ReactElement } from "react";
import { ElementProps } from ".";
import { Model, FileValue } from "shared";

interface ImageProps extends ElementProps {
    model: Model<FileValue>;
}

export class Image extends Component<ImageProps> {
    render(): ReactElement {
        let {
            model: {
                value: { path, name }
            }
        } = this.props;

        const base = "http://localhost:8086/";
        console.log(base + path);

        return (
            <img src={base + path} alt={name} style={{ minHeight: "300px" }} />
        );
    }
}

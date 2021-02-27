import React, { Component, ReactElement } from "react";
import { ElementProps } from ".";
import { InkValue, Model } from "shared";

interface InkProps extends ElementProps {
    model: Model<InkValue>;
}

export class Ink extends Component<InkProps> {
    private ref: React.RefObject<HTMLDivElement>;

    constructor(props: InkProps) {
        super(props);
        this.ref = React.createRef();
    }

    componentDidMount() {
        this.notifyInkRef();
    }

    componentDidUpdate() {
        this.notifyInkRef();
    }

    private notifyInkRef() {
        const { store, path } = this.props;
        if (store.lookupNode(path).selected) {
            // If I am being edited, give app my ref & path
            this.props.store.shellAction.inkRefChanged(this.ref);
        }
    }

    render(): ReactElement {
        let { store, path } = this.props;
        let editing = store.lookupNode(path).selected;

        if (editing) {
            return (
                <div
                    ref={this.ref}
                    className="ff"
                    style={{
                        backgroundColor: "white",
                        color: "black",
                        minHeight: "300px"
                    }}
                ></div>
            );
        } else {
            const base = "http://localhost:8086/";

            return <p>Pre-rendered ink will go here</p>;
        }
    }
}

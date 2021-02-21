import React, {
    RefObject,
    Component,
    ReactElement,
    KeyboardEvent,
    ClipboardEvent,
    FormEvent
} from "react";
import { ElementProps } from ".";
import { Model, TextValue } from "shared";
import marked from "marked";
import { observer } from "mobx-react";

interface InkProps extends ElementProps {
    model: Model<never>;
}

export class Ink extends Component<InkProps> {
    private ref: React.RefObject<HTMLDivElement>;

    constructor(props: InkProps) {
        super(props);
        this.ref = React.createRef();
    }

    componentDidMount() {
        this.props.store.setInkRef(this.ref);
    }

    componentDidUpdate() {
        this.props.store.setInkRef(this.ref);
    }

    render(): ReactElement {
        let { store, path } = this.props;
        let selected = store.lookupNode(path).selected;

        if (selected) {
            return (
                <div
                    ref={this.ref}
                    className="ff"
                    style={{
                        backgroundColor: "white",
                        color: "black",
                        minHeight: "300px"
                    }}
                >
                    Drawing Region
                </div>
            );
        } else {
            return (
                <div className="ff" style={{ minHeight: "300px" }}>
                    Static Region
                </div>
            );
        }
    }
}

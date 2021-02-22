import { observer } from "mobx-react";
import React, { Component, ReactElement, MouseEvent } from "react";
import { Model, Value, TextValue, PageValue } from "shared";
import { Store } from "../../store";

import { Script, Text } from "./text";
import { Ink } from "./ink";
import NestedPage from "./nestedPage";
import Unknown from "./unknown";
import { DragNode, DropNode } from "../dragDrop";

export { default as Page } from "./page";

export interface ElementProps {
    store: Store;
    path: number[];
    model: Model<Value>;
}

interface PageEntryProps {
    store: Store;
    path: number[];
    eid: number;
}

class PageEntry extends Component<PageEntryProps> {
    onClick(event: MouseEvent) {
        // Select element if click was not due to text range selection
        var selection = window.getSelection();
        if (selection !== null && selection.type !== "Range")
            this.props.store.select(this.props.path);

        event.stopPropagation();
    }

    render(): ReactElement | null {
        let { store, path, eid } = this.props;
        let model = store.lookupModel(eid);

        let childProps = { store, path, key: path.slice(-1)[0] };
        let { selected, expanded } = store.lookupNode(path);
        let visual = (() => {
            switch (model.type) {
                case "Text":
                    return (
                        <Text
                            model={model as Model<TextValue>}
                            {...childProps}
                        />
                    );
                case "Page":
                    return (
                        <NestedPage
                            model={model as Model<PageValue>}
                            {...childProps}
                        />
                    );
                case "Script":
                    return (
                        <Script
                            model={model as Model<TextValue>}
                            {...childProps}
                        />
                    );
                case "Ink":
                    return (
                        <Ink model={model as Model<never>} {...childProps} />
                    );
                default:
                    return <Unknown model={model} {...childProps} />;
            }
        })();

        let elementClass = "element" + (selected ? " selected" : "");
        let elementContentClass =
            "element-content" + (!expanded ? " leaf" : "");
        let elementComponent = (
            <div className={elementClass} onClick={(ev) => this.onClick(ev)}>
                <div
                    style={{ userSelect: "initial" }}
                    className={elementContentClass}
                >
                    {visual}
                </div>
            </div>
        );

        return (
            <DropNode path={path} store={store} append={false}>
                {" "}
                {selected ? (
                    <DragNode path={path} store={store}>
                        {elementComponent}
                    </DragNode>
                ) : (
                    elementComponent
                )}
            </DropNode>
        );
    }
}

export default observer(PageEntry);

import React, { ReactElement } from "react";
import { Store } from "../store";
import { DropNode } from "./dragDrop";
import { Proxy } from "shared";

interface AppendButtonProps {
    store: Store;
    path: number[];
}

export default function AppendButton(props: AppendButtonProps): ReactElement {
    let createAndAdd = async function (
        presentation: string,
        backing: string,
        backingValue: object
    ) {
        let inst = await props.store.hostAction.instantiate(
            presentation,
            backing,
            backingValue
        );
        props.store.pageAction.insert(inst, props.path, null);
    };

    let addPage = () => {
        createAndAdd("Page", "Internal", { entries: [] }).then();
    };

    let addText = () => {
        createAndAdd("Text", "Internal", { content: "Hello" }).then();
    };

    return (
        <DropNode append={true} {...props}>
            <div className="element">
                {" "}
                {/* for consistency only */}
                <div className="element-content leaf">
                    <button
                        style={{ marginLeft: "0px" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            addPage();
                        }}
                    >
                        +Page
                    </button>
                    <button
                        style={{ marginLeft: "0px" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            addText();
                        }}
                    >
                        +Text
                    </button>
                </div>
            </div>
        </DropNode>
    );
}

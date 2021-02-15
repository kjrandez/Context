import { ViewNode, ViewState, traverse, viewNode, pathsEqual } from ".";
import { NumDict, Model, Value, PageValue } from "shared";
import { Proxy } from "shared";
import { action, observable } from "mobx";

interface HierarchyChangeset {
    models: NumDict<Model<Value>>;
    children: {
        node: ViewNode;
        path: number[];
        newChildren: NumDict<ViewNode>;
        presentChildren: string[];
    }[];
    deselect: number[] | null;
}

export default class HierarcyActions {
    constructor(private state: ViewState) {}

    @action
    apply(newModel: Model<Value>) {
        let model = this.state.db[newModel.id];
        console.assert(model !== undefined);
        model.type = newModel.type;
        model.value = newModel.value;
    }

    async refresh(newModel: Model<PageValue> | null) {
        console.log("Refreshing page at root:");
        console.log(this.state.root.element.id);
        let models: NumDict<Model<Value>> = {};
        if (newModel !== null) {
            models[newModel.id] = newModel;
            console.log("adding new model to changeset");
        }

        let changeset = { models, children: [], deselect: null };
        console.log(changeset);
        await this.refreshHierarchy(this.state.root, [], changeset, 0);
        console.log("Changeset:");
        console.log(changeset);
        this.applyHierarchyChanges(changeset);
    }

    async broadcast(element: Proxy) {
        console.log("Broadcast");
        if (this.state.db[element.id] === undefined) {
            console.log("Broadcast for element not in database");
            return;
        }

        // Refresh database and hierarchy with the new element
        let model = await element.call<Model<Value>>("model", []);
        console.log("New model:");
        console.log(model);
        if (model.type === "Page") {
            await this.refresh(model as Model<PageValue>);
        } else {
            this.apply(model);
        }
    }

    @action
    expand(path: number[]) {
        let node = traverse(this.state.root, path);
        node.expanded = true;

        // Queue up hiearchy refresh for the now greater depth
        setTimeout(() => {
            let changeset: HierarchyChangeset = {
                models: {},
                children: [],
                deselect: null,
            };
            this.refreshHierarchy(node, [], changeset, 0).then(() =>
                this.applyHierarchyChanges(changeset)
            );
        }, 0);
    }

    @action
    collapse(path: number[]) {
        let node = traverse(this.state.root, path);
        node.expanded = false;
    }

    @action
    private applyHierarchyChanges(changeset: HierarchyChangeset) {
        // Insert new database entries
        for (const key in changeset.models) {
            let model = this.state.db[key];
            if (model === undefined) {
                this.state.db[key] = changeset.models[key];
            } else {
                let newModel = changeset.models[key];
                model.type = newModel.type;
                model.value = newModel.value;
            }
        }

        // Refresh child entries for each node
        for (const {
            node,
            path,
            newChildren,
            presentChildren,
        } of changeset.children) {
            // Add new keys
            for (const key in newChildren) {
                node.children[key] = newChildren[key];
            }
            // Remove stale keys
            for (const key in node.children) {
                if (!presentChildren.includes(key)) {
                    let selectedPath = this.state.selection;
                    let deletedPath = [...path, parseInt(key)];
                    if (
                        selectedPath !== null &&
                        pathsEqual(selectedPath, deletedPath)
                    ) {
                        this.state.selection = null;
                        // No need as it is deleted...
                        //traverse(this.state.root, deletedPath).selected = false;
                        // Potentially do something to persist the deleted hierarchy ...
                    }

                    delete node.children[key];
                }
            }
        }
    }

    private async fetchModel(element: Proxy, changeset: HierarchyChangeset) {
        // First look in changeset
        let model = changeset.models[element.id];

        // Then look in existing dictionary
        if (model === undefined) {
            console.log("not in changeset");
            model = this.state.db[element.id] as Model<Value>;
        } else {
            console.log("FOUND in changeset");
        }

        // Then lookup from host
        if (model === undefined) {
            console.log("not in db, lookup");
            model = await element.call<Model<Value>>("model", []);
            changeset.models[element.id] = observable(model);
        }

        return model;
    }

    private async refreshHierarchy(
        node: ViewNode,
        path: number[],
        changeset: HierarchyChangeset,
        collapsedDepth: number
    ) {
        // Lookup model, pulling from kernel if not yet present
        console.log("Looking up value for:");
        console.log(node.element);
        let { type, value } = (await this.fetchModel(
            node.element,
            changeset
        )) as Model<PageValue>;

        // No further refresh if this is a leaf node
        if (type !== "Page") return;

        let newChildren: NumDict<ViewNode> = {};
        let presentChildren: string[] = [];

        console.log("refreshing at path");
        console.log(path);
        console.log(type);
        console.log(value);
        for (const { key, element } of value.entries) {
            presentChildren.push(key.toString());

            // Look up previous or create new nodes for all children in this page model
            let child = node.children[key];
            if (child === undefined) {
                child = viewNode(element, false);
                newChildren[key] = child;
            }

            // Recurse until past safe depth of collapsed pages
            if (collapsedDepth < 1)
                await this.refreshHierarchy(
                    child,
                    [...path, key],
                    changeset,
                    collapsedDepth + (node.expanded ? 0 : 1)
                );
        }

        changeset.children.push({ node, path, newChildren, presentChildren });
    }
}

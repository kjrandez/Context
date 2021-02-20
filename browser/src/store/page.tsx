import { Proxy } from "shared";
import { traverse, ViewState } from ".";

export default class PageActions {
    constructor(private state: ViewState) {}

    move(
        srcEntryPath: number[],
        destPagePath: number[],
        beforeEntryKey: number | null
    ) {
        let srcEntryKey = srcEntryPath.slice(-1)[0];
        let srcPagePath = srcEntryPath.slice(0, -1);
        let srcPage = traverse(this.state.root, srcPagePath).element;
        let inst = traverse(this.state.root, srcEntryPath).element;

        srcPage.call("remove", [srcEntryKey]);
        this.insert(inst, destPagePath, beforeEntryKey);
    }

    delete(path: number[]) {
        let entryKey = path.slice(-1)[0];
        let pagePath = path.slice(0, -1);

        let page = traverse(this.state.root, pagePath).element;
        page.call("remove", [entryKey]);
    }

    insert(inst: Proxy, destPagePath: number[], beforeEntryKey: number | null) {
        let destPage = traverse(this.state.root, destPagePath).element;

        if (beforeEntryKey === null) {
            destPage.call("append", [inst]);
        } else {
            destPage.call("insertBefore", [inst, beforeEntryKey]);
        }
    }
}

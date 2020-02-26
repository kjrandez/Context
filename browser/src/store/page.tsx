import {traverse, ViewState} from '.';
import page from '../view/elements/page';

export default class PageActions
{
    constructor(private state: ViewState) {}

    move(srcEntryPath: number[], destPagePath: number[], beforeEntryKey: number | null) {
        let srcEntryKey = srcEntryPath.slice(-1)[0];
        let srcPagePath = srcEntryPath.slice(0, -1);
        let srcPage = traverse(this.state.root, srcPagePath).element;
        let srcElement = traverse(this.state.root, srcEntryPath).element;

        let destPage = traverse(this.state.root, destPagePath).element;

        srcPage.send("remove", [srcEntryKey]);
        if (beforeEntryKey === null)
            destPage.send("append", [srcElement]);
        else
            destPage.send("insertBefore", [srcElement, beforeEntryKey]);
    }

    delete(path: number[]) {
        let entryKey = path.slice(-1)[0];
        let pagePath = path.slice(0, -1);

        let page = traverse(this.state.root, pagePath).element;
        page.send("remove", [entryKey]);
    }
}

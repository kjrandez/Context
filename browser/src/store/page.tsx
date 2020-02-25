import {traverse, ViewState} from '.';

export default class PageActions
{
    constructor(private state: ViewState) {}

    delete(path: number[]) {
        let entryKey = path.slice(-1)[0];
        let pagePath = path.slice(0, -1);

        let page = traverse(this.state.root, pagePath).element;
        page.send("remove", [entryKey]);
    }
}

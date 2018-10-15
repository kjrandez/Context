export default class PageAction
{
    constructor(app) {
        this.app = app;
    }

    enterPage(tag) {
        this.app.enterPage(tag.path, tag.id);
    }
}

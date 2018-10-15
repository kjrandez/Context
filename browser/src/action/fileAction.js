export default class FileAction
{
    constructor(fragment) {
        this.fragment = fragment;

        this.openInDefault = this.openInDefault.bind(this);
        this.openInExplorer = this.openInExplorer.bind(this);
    }

    openInDefault() {
        this.fragment.invokeBackground("openInDefault", [], true);
    }

    openInExplorer() {
        this.fragment.invokeBackground("openInExplorer", [], true)
    }
}

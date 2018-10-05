export default class FileAction
{
    constructor(fragment, value, type) {
        this.fragment = fragment;
        this.value = value;
        this.type = type;

        this.openInDefault = this.openInDefault.bind(this);
    }

    openInDefault() {
        this.fragment.invokeBackground("openInDefault", [], true);
    }
}

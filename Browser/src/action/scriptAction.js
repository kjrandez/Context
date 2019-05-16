import TextAction from './textAction';

export default class ScriptAction
{
    constructor(fragment, app) {
        this.fragment = fragment;
        this.app = app;
    }

    run(tag, threaded) {
        var path = tag.path;
        var parentId = path[path.length - 1];
        var parent = this.app.store.fragment(parentId)

        if(threaded)
            this.props.fragment.invokeBackground("execute", [parent])
        else
            this.props.fragment.invoke("execute", [parent]);
    }
}

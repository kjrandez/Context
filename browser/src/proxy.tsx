import Presenter from "./presenter";

// Acts as a foreign object proxy in the JSON RPC and also wraps the model in the MVP UI

export default class Proxy
{
    immId: number;
    dispatchCall: Function;
    paths: Presenter[][] = [];

    constructor(tag: number, dispatcher: Function) {
        this.dispatchCall = dispatcher
        this.immId = tag;
        this.paths = [];
    }

    id() {
        return this.immId;
    }

    async call<T>(selector: string, args: any[] = []): Promise<T> {
        return await this.dispatchCall(this.immId, selector, args, true);
    }

    send(selector: string, args: any[] = []) {
        this.dispatchCall(this.immId, selector, args, false);
    }

    sensitivePaths() {
        return this.paths;
    }

    attach(path: Presenter[]) {
        this.paths.push(path);
    }

    detach(path: Presenter[]) {
        var index = this.paths.findIndex(entry => entry === path);
        if(index >= 0)
            this.paths.splice(index, 1);
    }
}

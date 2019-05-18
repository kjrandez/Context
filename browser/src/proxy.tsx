import { Presenter } from "./interfaces";

// Acts as a foreign object proxy in the JSON RPC and also wraps the model in the MVP UI

export default class Proxy
{
    immId: number;
    dispatchCall: Function;
    presenters: Presenter[] = [];

    constructor(tag: number, dispatcher: Function) {
        this.dispatchCall = dispatcher
        this.immId = tag;
        this.presenters = [];
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

    handleChange(value: any) {
        this.presenters.forEach(entry => entry.modelChanged(this, value));
    }

    attach(presenter: Presenter) {
        this.presenters.push(presenter);
    }

    detach(presenter: Presenter) {
        var index = this.presenters.findIndex(entry => entry === presenter);
        if(index >= 0)
            this.presenters.splice(index, 1);
    }
}

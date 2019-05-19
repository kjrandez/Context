import Presenter from './presenter';

export type Subscriber<T> = {
    path: Presenter[],
    callback: (_:T) => void
}

export type SubscriberFilter<T> = (path: Presenter[], prevState: T) => boolean;

export class Container<T>
{
    state: T;
    subscribers: Subscriber<T>[];

    constructor(initial: T) {
        this.state = initial;
        this.subscribers = [];
    }

    attach(path: Presenter[], callback: (_:T) => void) {
        this.subscribers.push({
            path: path,
            callback: callback
        });
    }

    detach(path: Presenter[]) {
        var index = this.subscribers.findIndex(entry => entry.path === path);
        if(index >= 0)
            this.subscribers.splice(index, 1);
    }

    set(newState: T, filter: SubscriberFilter<T> = () => true) {
        let receivers = this.subscribers.filter(subscriber => filter(subscriber.path, this.state));
        this.state = newState;
        receivers.forEach(receiver => receiver.callback(this.state))
        
        let paths = receivers.map(X => X.path);
        let changeRoot = commonRoot(paths); 

        if (changeRoot != null) {
            changeRoot.refresh();
        }
    }
}

export class Proxy
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

    broadcast() {
        let changeRoot = commonRoot(this.paths); 

        if (changeRoot != null) {
            (async () => {
                for (const path of this.paths)
                    await path.slice(-1)[0].onUpdate(this);
                changeRoot.refresh();
            })();
        }
    }
}

function commonRoot<T>(paths: T[][]) {
    let root: T | null = null;
    
    if (paths.length === 1) {
        root = paths[0].slice(-1)[0];
    }
    else if (paths.length > 1) {
        let finished = false;
        let i = 0;

        while (!finished) {
            let current: T | null = null;

            for (const path of paths) {
                // If a path doesn't extend this far, we are done checking this level
                if (path.length <= i) {
                    current = null;
                    finished = true;
                    break;
                }

                if (current == null) {
                    // All other paths checked against this level of the first path
                    current = path[i]
                }
                else if (path[i] !== current) {
                    // A path doesn't match the first path, we are done checking this level
                    current = null;
                    finished = true;
                    break;
                }
            }

            // If current is set, all paths are matching at this index, move the root forward
            if (current != null) {
                root = current;
            }

            i ++;
        }
    }

    return root;
}

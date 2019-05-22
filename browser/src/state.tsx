import { Presenter } from './presenter';

type Subscriber<S extends Presenter, T, R> = {
    path: S[],
    callback: (_:T) => R
}

export class Subscribable<T>
{
    syncSubscribers: Subscriber<Presenter, T, void>[] = [];
    asyncSubscribers: Subscriber<Presenter, T, Promise<void>>[] = [];

    attach(path: Presenter[], callback: (_:T) => void) {
        this.syncSubscribers.push({
            path: path,
            callback: callback
        });
    }

    detach(path: Presenter[]) {
        var index = this.syncSubscribers.findIndex(entry => entry.path === path);
        if (index >= 0)
            this.syncSubscribers.splice(index, 1);
    }

    attachAsync(path: Presenter[], callback: (_:T) => Promise<void>) {
        this.asyncSubscribers.push({path: path, callback: callback});
    }

    detachAsync(path: Presenter[]) {
        var index = this.asyncSubscribers.findIndex(entry => entry.path === path);
        if (index >= 0)
            this.asyncSubscribers.splice(index, 1);
    }
}

export type PathFilter<T> = (path: Presenter[], prevState: T) => boolean;

type SetAction = {
    setStateAction: () => void;
    syncPaths: Presenter[][];
    asyncPaths: Presenter[][];
    dispatchSyncAction: () => void;
    dispatchAsyncAction: () => Promise<void>;
}

export class Container<T> extends Subscribable<T>
{
    private state: T;

    constructor(initial: T) {
        super();
        this.state = initial;
    }

    get(): T {
        return this.state;
    }

    set(newState: T, filter: PathFilter<T> = () => true) {
        let setter = this.setter(newState, filter);
        Container.setMany(setter);
    }

    setter(newState: T, filter: PathFilter<T> = () => true): SetAction {
        let syncReceivers = this.syncSubscribers.filter(subscriber => filter(subscriber.path, this.state));
        let asyncReceivers = this.asyncSubscribers.filter(subscriber => filter(subscriber.path, this.state));

        return {
            setStateAction: () => this.state = newState,
            syncPaths: syncReceivers.map(X => X.path),
            asyncPaths: asyncReceivers.map(X => X.path),
            dispatchSyncAction: () => dispatchSync(syncReceivers, newState),
            dispatchAsyncAction: async () => await dispatchAsync(asyncReceivers, newState)
        };
    }

    static setMany(...setters: SetAction[]) {
        let allSyncPaths = setters.reduce(
            (paths, action) => paths.concat(action.syncPaths),
            [] as Presenter[][]
        );

        let allAsyncPaths = setters.reduce(
            (paths, action) => paths.concat(action.asyncPaths),
            [] as Presenter[][]
        );

        // Update state
        setters.forEach(action => action.setStateAction());

        // Inform synchronous
        setters.forEach(action => action.dispatchSyncAction());

        // Refresh common root of all sync subscribers
        refresh(allSyncPaths);

        // Inform asynchronous
        Promise.all(setters.map(action => action.dispatchAsyncAction())).then(() => {

            // Then, refresh common root of all async subscribers
            refresh(allAsyncPaths);
        });
    }
}

export class Proxy<T> extends Subscribable<T>
{
    id: number;
    dispatchCall: Function;

    constructor(tag: number, dispatcher: Function) {
        super();
        this.dispatchCall = dispatcher
        this.id = tag;
    }

    attach(_: Presenter[], __: (_:T) => void) {
        throw new Error("Proxy ignores synchronous subscribers.");
    }

    detach(_: Presenter[]) {
        throw new Error("Proxy ignores synchronous subscribers.");
    }

    async call<T>(selector: string, args: any[] = []): Promise<T> {
        return await this.dispatchCall(this.id, selector, args, true);
    }

    send(selector: string, args: any[] = []) {
        this.dispatchCall(this.id, selector, args, false);
    }

    async broadcast(value: T): Promise<void> {
        dispatchAsync(this.asyncSubscribers, value).then(
            () => refresh(this.asyncSubscribers.map(subscriber => subscriber.path))
        );
    }
}

function dispatchSync<T>(receivers: Subscriber<Presenter, T, void>[], result: T) {
    receivers.forEach(receiver => receiver.callback(result))
}

async function dispatchAsync<T>(receivers: Subscriber<Presenter, T, Promise<void>>[], result: T) {
    for (const subscriber of receivers)
        await subscriber.callback(result);
}

function refresh(paths: Presenter[][]) {
    let changeRoot = commonRoot(paths);
    if (changeRoot != null)
        changeRoot.refresh();
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

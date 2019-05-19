import { AsyncPresenter, Presenter } from './presenter';

type Subscriber<S extends Presenter, T, R> = {
    path: S[],
    callback: (_:T) => R
}

class Subscribable<S extends Presenter, T, R>
{
    subscribers: Subscriber<S, T, R>[] = [];

    attach(path: S[], callback: (_:T) => R) {
        this.subscribers.push({
            path: path,
            callback: callback
        });
    }

    detach(path: S[]) {
        var index = this.subscribers.findIndex(entry => entry.path === path);
        if (index >= 0)
            this.subscribers.splice(index, 1);
    }
}

export type PathFilter<T> = (path: Presenter[], prevState: T) => boolean;

class GenericContainer<S extends Presenter, T, R> extends Subscribable<S, T, R>
{
    state: T;

    constructor(initial: T) {
        super();
        this.state = initial;
    }

    set(newState: T, filter: PathFilter<T> = () => true) {
        let receivers = this.subscribers.filter(subscriber => filter(subscriber.path, this.state));
        this.state = newState;
        dispatch(receivers, this.state);
    }
}

export class Container<T> extends GenericContainer<Presenter, T, void> {}

export class AsyncContainer<T> extends GenericContainer<AsyncPresenter, T, Promise<void>>
{
    async set(newState: T, filter: PathFilter<T> = () => true) {
        let receivers = this.subscribers.filter(subscriber => filter(subscriber.path, this.state));
        this.state = newState;
        await dispatchAsync(receivers, this.state);
    }
}

export class DualContainer<T> extends GenericContainer<Presenter, T, void>
{
    delayedSubscribers: Subscriber<AsyncPresenter, T, Promise<void>>[] = [];

    attachDelayed(path: AsyncPresenter[], callback: (_:T) => Promise<void>) {
        this.delayedSubscribers.push({path: path, callback: callback});
    }

    detachDelayed(path: AsyncPresenter[]) {
        var index = this.delayedSubscribers.findIndex(entry => entry.path === path);
        if (index >= 0)
            this.delayedSubscribers.splice(index, 1);
    }

    async set(newState: T, filter: PathFilter<T> = () => true) {
        let oldState = this.state;
        super.set(newState, filter);

        let delayedReceivers = this.delayedSubscribers.filter(subs => filter(subs.path, oldState));
        await dispatchAsync(delayedReceivers, this.state);
    }
}

export class Proxy<T> extends Subscribable<AsyncPresenter, T, Promise<void>>
{
    immId: number;
    dispatchCall: Function;

    constructor(tag: number, dispatcher: Function) {
        super();
        this.dispatchCall = dispatcher
        this.immId = tag;
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

    broadcast(value: T) {
        dispatchAsync(this.subscribers, value);
    }
}

function dispatch<S extends Presenter, T, R>(
    receivers: Subscriber<S, T, R>[], result: T)
{
    let paths = receivers.map(X => X.path);
    let changeRoot = commonRoot(paths); 

    if (changeRoot != null) {
        receivers.forEach(receiver => receiver.callback(result))
        changeRoot.refresh();
    }
}

async function dispatchAsync<S extends AsyncPresenter, T, R>(
    receivers: Subscriber<S, T, Promise<R>>[], result: T)
{
    let paths = receivers.map(X => X.path);
    let changeRoot = commonRoot(paths);

    if (changeRoot != null) {
        for (const subscriber of receivers)
            await subscriber.callback(result);
        changeRoot.refresh();
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

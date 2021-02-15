import { Resolver } from "dns";

export function mapObj<T, R>(
    obj: { [_: string]: T },
    valueMapping: (_: T) => R,
    keyMapping: (_: string) => string = (K) => K
) {
    return Object.assign(
        {},
        ...Object.entries(obj).map(([K, V]: [string, T]) => ({
            [keyMapping(K)]: valueMapping(V),
        }))
    );
}

export type StrDict<T> = { [_: string]: T };
export type NumDict<T> = { [_: number]: T };

export type Value = { [_: string]: any };
export interface Model<T extends Value> {
    id: number;
    type: string;
    value: T;
}

export type PageEntry = { key: number; element: Proxy };
export type PageValue = { entries: PageEntry[] };
export type TextValue = { content: string };

export interface Proxyable {
    proxyableId: number | null;
}
export class Proxy {
    id: number;
    dispatchCall: Function;

    constructor(tag: number, dispatcher: Function) {
        this.dispatchCall = dispatcher;
        this.id = tag;
    }

    async call<T>(selector: string, args: any[] = []): Promise<T> {
        return await this.dispatchCall(this.id, selector, args, true);
    }
}

export type Argument = {
    type: string;
    value: any;
};

class TagCache<T> {
    refs: T[] = [];
    nextIndex: number = 0;
    freeIndexes: number[] = [];

    assignTag(object: T) {
        let index: number | undefined = this.freeIndexes.pop();
        if (index !== undefined) {
            this.refs[index] = object;
            return index;
        } else {
            this.refs.push(object);
            index = this.nextIndex++;
            return index;
        }
    }

    getObject(tag: number) {
        return this.refs[tag];
    }

    freeTag(tag: number) {
        this.freeIndexes.push(tag);
    }
}

export abstract class ProxyableTable {
    constructor(private service: Proxyable) {}

    abstract lookup(tag: number): Proxyable;

    getObject(tag: number) {
        if (tag == 0) {
            return this.service;
        } else {
            return this.lookup(tag);
        }
    }

    getTag(object: Proxyable) {
        if (object.proxyableId == null) {
            throw new Error("Rpc Error: Proxyable is not tagged");
        }
        return object.proxyableId;
    }
}

class ProxyMap {
    make: Function;
    refs: { [_: number]: Proxy } = {};

    constructor(makeProxy: Function) {
        this.make = makeProxy;
    }

    getObject(tag: number): Proxy {
        if (tag in this.refs) return this.refs[tag];

        let proxy = this.make(tag);
        this.refs[tag] = proxy;
        return proxy;
    }
}

export type TransactionModel = {
    id: number;
    subject: Proxy;
    others: Proxy[];
    value: any;
};

interface CallResolver {
    resolve: Function;
    reject: Function;
}

export class Rpc {
    pendingCalls: TagCache<CallResolver> = new TagCache<CallResolver>();
    foreignObjects: ProxyMap;

    constructor(
        private localObjects: ProxyableTable,
        private send: (_: string) => void
    ) {
        let dispatcher = this.dispatchCall.bind(this);
        this.foreignObjects = new ProxyMap(
            (tag: number) => new Proxy(tag, dispatcher)
        );
    }

    dispatchCall(targetId: number, selector: string, args: any[]) {
        let argDescs: Argument[] = args.map((X: any) =>
            this.encodedArgument(X)
        );

        return new Promise<any>((resolve, reject) =>
            this.dispatchWebsocketSend({
                type: "call",
                id: this.pendingCalls.assignTag({ resolve, reject }),
                target: targetId,
                selector: selector,
                arguments: argDescs,
            })
        );
    }

    dispatchWebsocketSend(data: object) {
        this.send(JSON.stringify(data));
    }

    handleWebsocketReceive(message: string) {
        const msgObj = JSON.parse(message);
        console.log(msgObj);

        switch (msgObj.type) {
            case "call":
                this.handleCall(
                    msgObj.id,
                    msgObj.target,
                    msgObj.selector,
                    msgObj.arguments
                );
                break;
            case "return":
                this.handleReturn(msgObj.id, msgObj.result);
                break;
            case "exception":
                this.handleException(msgObj.id, msgObj.message);
                break;
            default:
                throw new Error("Invalid message received");
        }
    }

    handleCall(
        callId: number,
        targetId: number,
        selector: string,
        argDescs: Argument[]
    ) {
        let target: Proxyable = this.localObjects.getObject(targetId);
        let args: any[] = argDescs.map((X: any) => this.decodedArgument(X));
        try {
            let func = (target as any)[selector];
            if (typeof func !== "function")
                throw new Error(`${selector} is undefined or not a function`);

            let result = func.apply(target, args);

            this.dispatchWebsocketSend({
                type: "return",
                id: callId,
                result: this.encodedArgument(result),
            });
        } catch (err) {
            this.dispatchWebsocketSend({
                type: "exception",
                id: callId,
                message: err.toString(),
            });
        }
    }

    handleReturn(localId: number, resultDesc: any) {
        let result = this.decodedArgument(resultDesc);
        let resolver = this.pendingCalls.getObject(localId);
        this.pendingCalls.freeTag(localId);

        resolver.resolve(result);
    }

    handleException(localId: number, errorMessage: string) {
        let resolver = this.pendingCalls.getObject(localId);
        this.pendingCalls.freeTag(localId);

        resolver.reject(errorMessage);
    }

    decodedArgument(argDesc: Argument): any {
        if (argDesc.type === "local")
            return this.foreignObjects.getObject(argDesc.value);
        else if (argDesc.type === "remote")
            return this.localObjects.getObject(argDesc.value);
        else if (argDesc.type === "list")
            return argDesc.value.map((X: any) => this.decodedArgument(X));
        else if (argDesc.type === "dict")
            return mapObj(argDesc.value, (X: any) => this.decodedArgument(X));
        // primitive
        else return argDesc.value;
    }

    encodedArgument(arg: any): Argument {
        if (arg instanceof Proxy) return { type: "remote", value: arg.id };
        else if (Object(arg) === arg && "proxyableId" in arg) {
            return {
                type: "local",
                value: this.localObjects.getTag(arg),
            };
        } else if (arg instanceof Array)
            return {
                type: "list",
                value: arg.map((X) => this.encodedArgument(X)),
            };
        else if (arg instanceof Object)
            return {
                type: "dict",
                value: mapObj(arg, (X) => this.encodedArgument(X)),
            };
        else return { type: "primitive", value: arg };
    }
}

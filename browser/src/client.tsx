import { Proxy } from './state';
import { mapObj } from './interfaces';

export interface Proxyable {
    proxyableId: number | null;
}

export type Argument = {
    type: string;
    value: any;
}

class TagCache<T>
{
    refs: T[] = [];
    nextIndex: number = 0;
    freeIndexes: number[] = [];

    assignTag(object: T) {
        let index: number | undefined = this.freeIndexes.pop();
        if (index !== undefined) {
            this.refs[index] = object;
            return index;
        }
        else {
            this.refs.push(object);
            index = this.nextIndex ++;
            return index;
        }
    }

    getObject(tag: number) {
        return this.refs[tag];
    }

    freeTag(tag: number) {
        this.freeIndexes.push(tag)
    }
}

class ProxyableTable
{
    refs: Proxyable[];
    index: number = 0;

    constructor(rootObject: Proxyable) {
        rootObject.proxyableId = 0;
        this.refs = [rootObject];
    }

    getObject(tag: number) {
        return this.refs[tag];
    }

    getTag(object: Proxyable) {
        if (object.proxyableId == null)
            object.proxyableId = ++ this.index;

        return object.proxyableId;
    }
}

class ProxyMap
{
    make: Function;
    refs: { [_: number]: Proxy<any> } = {};

    constructor(makeProxy: Function) {
        this.make = makeProxy;
    }

    getObject(tag: number) {
        if (tag in this.refs)
            return this.refs[tag];

        let proxy = this.make(tag);
        this.refs[tag] = proxy;
        return proxy;
    }
}

type TransactionModel = {
    id: number,
    subject: Proxy<any>,
    value: any
}

export default class Client
{
    websocket: WebSocket;

    pendingCalls: TagCache<Function> = new TagCache<Function>();

    localObjects: ProxyableTable;
    foreignObjects: ProxyMap;

    constructor(connected: (_: Proxy<never>) => Promise<void>, disconnected: () => void) {
        let clientService = {
            proxyableId: null,
            broadcast: (trans: TransactionModel) => trans.subject.broadcast(trans.value).then()
        };
        this.localObjects = new ProxyableTable(clientService);

        let dispatcher = this.dispatchCall.bind(this);
        this.foreignObjects = new ProxyMap((tag: number) => new Proxy(tag, dispatcher));
        
        this.websocket = new WebSocket("ws://localhost:8085/broadcast");
        this.websocket.onmessage = event => this.handleWebsocketReceive(event);
        this.websocket.onclose = (_) => disconnected();

        let hostService = this.foreignObjects.getObject(0);
        this.websocket.onopen = (_) => connected(hostService).then();
    }

    dispatchWebsocketSend(data: object) {
        this.websocket.send(JSON.stringify(data));
    }

    dispatchCall(targetId: number, selector: string, args: any[]) {
        let argDescs: Argument[] = args.map((X: any) => this.encodedArgument(X));
        
        return new Promise<any>((resolve, reject) => this.dispatchWebsocketSend({
            type: 'call',
            id: this.pendingCalls.assignTag(resolve),
            target: targetId,
            selector: selector,
            arguments: argDescs
        }));
    }

    handleWebsocketReceive(event: MessageEvent) {
        var msg = JSON.parse(event.data);

        switch(msg.type) {
            case 'send':
                this.handleSend(msg.target, msg.selector, msg.arguments);
                break;
            case 'call':
                this.handleCall(msg.id, msg.target, msg.selector, msg.arguments);
                break;
            case 'return':
                this.handleReturn(msg.id, msg.result)
                break;
            default:
                console.log("Invalid message received:");
                console.log(msg);
                break;
        }
    }

    handleSend(targetId: number, selector: string, argDescs: Argument[]) {
        let target: Proxyable = this.localObjects.getObject(targetId);
        let args: any[] = argDescs.map((X: any) => this.decodedArgument(X));

        (target as any)[selector].apply(target, args)
    }

    handleCall(foreignId: number, targetId: number, selector: string, argDescs: Argument[]) {
        let target: Proxyable = this.localObjects.getObject(targetId);
        let args: any[] = argDescs.map((X: any) => this.decodedArgument(X));

        let result = (target as any)[selector].apply(target, args)

        this.dispatchWebsocketSend({
            type: 'return',
            id: foreignId,
            result: this.encodedArgument(result)
        });
    }

    handleReturn(localId: number, resultDesc: any) {
        let result = this.decodedArgument(resultDesc);
        let resolve = this.pendingCalls.getObject(localId);
        this.pendingCalls.freeTag(localId);

        resolve(result);
    }

    decodedArgument(argDesc: Argument): any {
        if (argDesc.type === 'hostObject')
            return this.foreignObjects.getObject(argDesc.value)
        else if (argDesc.type === 'clientObject')
            return this.localObjects.getObject(argDesc.value);
        else if (argDesc.type === 'list')
            return argDesc.value.map((X: any) => this.decodedArgument(X))
        else if (argDesc.type === 'dictionary')
            return mapObj(argDesc.value, (X: any) => this.decodedArgument(X))
        else
            return argDesc.value;
    }

    encodedArgument(arg: any): Argument {
        if (arg instanceof Proxy) 
            return { type: 'hostObject', value: arg.id };
        else if ('proxyableId' in arg) // "instanceof Proxyable"
            return { type: 'clientObject', value: this.localObjects.getTag(arg) };
        else if (arg instanceof Array)
            return { type: 'list', value: arg.map(X => this.encodedArgument(X))}
        else if (arg instanceof Object)
            return { type: 'dictionary', value: mapObj(arg, X => this.encodedArgument(X))}
        else
            return { type: 'primitive', value: arg };
    }
}

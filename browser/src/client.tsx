import Proxy from './proxy';
import { Proxyable, Argument, mapObjValues } from './interfaces';

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
    refs: { [_: number]: Proxy } = {};

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

export default class Client
{
    websocket: WebSocket;

    pendingCalls: TagCache<Function> = new TagCache<Function>();

    localObjects: ProxyableTable;
    foreignObjects: ProxyMap;

    constructor(connected: Function, disconnected: Function, broadcast: Function) {
        let clientService = {
            proxyableId: 0,
            broadcast: broadcast
        };
        this.localObjects = new ProxyableTable(clientService);

        let dispatcher = this.dispatchCall.bind(this);
        this.foreignObjects = new ProxyMap((tag: number) => new Proxy(tag, dispatcher));
        
        this.websocket = new WebSocket("ws://localhost:8085/broadcast");
        this.websocket.onmessage = event => this.websocketReceive(event);
        this.websocket.onclose = (_) => disconnected;

        let hostService = this.foreignObjects.getObject(0);
        this.websocket.onopen = (_) => { connected(hostService) };
    }

    websocketSend(data: object) {
        this.websocket.send(JSON.stringify(data));
    }

    websocketReceive(event: MessageEvent) {
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

    dispatchCall(targetId: number, selector: string, args: any[]) {
        let argDescs: Argument[] = args.map((X: any) => this.encodedArgument(X));
        
        return new Promise<any>((resolve, reject) => this.websocketSend({
            type: 'call',
            id: this.pendingCalls.assignTag(resolve),
            target: targetId,
            selector: selector,
            arguments: argDescs
        }));
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

        this.websocketSend({
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
            return mapObjValues(argDesc.value, (X: any) => this.decodedArgument(X))
        else
            return argDesc.value;
    }

    encodedArgument(arg: any): Argument {
        if (arg instanceof Proxy) 
            return { type: 'hostObject', value: arg.id() };
        else if ('proxyableId' in arg) // "instanceof Proxyable"
            return { type: 'clientObject', value: this.localObjects.getTag(arg) };
        else if (arg instanceof Array)
            return { type: 'list', value: arg.map(X => this.encodedArgument(X))}
        else if (arg instanceof Object)
            return { type: 'dictionary', value: mapObjValues(arg, X => this.encodedArgument(X))}
        else
            return { type: 'primitive', value: arg };
    }
}

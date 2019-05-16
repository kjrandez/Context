import Proxy from './proxy';
import { Proxyable } from './interfaces';

export default class Client
{
    websocket: WebSocket;

    pendingCalls: TagCache<Function> = new TagCache<Function>();

    localObjects: ProxyableTable;
    foreignObjects: ProxyMap;

    constructor(connected: Function, disconnected: Function) {
        let clientService = new ClientService();
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
        console.log("Received message: ");
        console.log(msg);

        switch(msg.type) {
            case 'call':
                this.handleCall(msg.id, msg.target, msg.selector, msg.arguments);
                break;
            case 'return':
                this.handleReturn(msg.id, msg.result)
                break;
            default:
                console.log("Unhandled message");
                break;
        }
    }

    dispatchCall(targetId: number, selector: string, args: any[]) {
        let argDescs: any[] = args.map((X: any) => this.encodedArgument(X));
        
        return new Promise<any>((resolve, reject) => this.websocketSend({
            type: 'call',
            id: this.pendingCalls.assignTag(resolve),
            target: targetId,
            selector: selector,
            arguments: argDescs
        }));
    }

    handleCall(foreignId: number, targetId: number, selector: string, argDescs: []) {
        let target: any = this.localObjects.getObject(targetId);
        let args: any[] = argDescs.map((X: any) => this.decodedArgument(X));

        let result: any = target[selector].apply(target, args)

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

    decodedArgument(argDesc: any) {
        if (argDesc.type == 'hostObject')
            return this.foreignObjects.getObject(argDesc.id) // Fragment ~= Proxy
        else if (argDesc.type == 'clientObject')
            return this.localObjects.getObject(argDesc.id);
        else
            return argDesc.value;
    }

    encodedArgument(arg: any): any {
        if (arg instanceof Proxy) 
            return { type: 'hostObject', id: arg.id() };
        else if ('proxyableId' in arg) // instanceof Proxyable
            return { type: 'clientObject', id: this.localObjects.getTag(arg) };
        else
            return { type: 'primitive', value: arg };
    }
}

class ClientService implements Proxyable
{
    proxyableId: number | null = null;

    broadcastChange(foreignObject: Proxy, model: any) {
        foreignObject.handleChange(model);
    }
}

// This is used to store promises, so indexes can be re-used, and you only need to look up
// object by tag, not tag by object.

class TagCache<T>
{
    refs: T[] = [];
    nextIndex: number = 0;
    freeIndexes: number[] = [];

    assignTag(object: T) {
        let index: number | undefined = this.freeIndexes.pop();
        if (index != undefined) {
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

// This is used to record objects marshalled across the web socket interface, so indexes should
// never be repeated, and we need to look up both object by tag and tag by object

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

// This is used to record foreign objects proxies, so indexes are sparse and we need to look up
// object by index and index by object

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

import {
    Proxy,
    ProxyableTable,
    Proxyable,
    Rpc,
    TransactionModel
} from "shared";

export default class Client extends Rpc {
    static connect(
        connected: (_: Proxy) => Promise<void>,
        disconnected: () => void,
        broadcast: (_: Proxy) => Promise<void>
    ) {
        const websocket = new WebSocket("ws://localhost:8085/broadcast");
        let send = (message: string) => websocket.send(message);
        let table = new GenericProxyableTable(new ClientService(broadcast));
        let client = new Client(table, send);
        let hostService = client.foreignObjects.getObject(0);

        websocket.onmessage = (event) => {
            client.handleWebsocketReceive(event.data);
        };
        websocket.onclose = (_) => disconnected();
        websocket.onopen = (_) => connected(hostService).then();
    }
}

class ClientService extends Proxyable {
    constructor(private broadcastCallback: (_: Proxy) => Promise<void>) {
        super();
    }

    broadcast(trans: TransactionModel) {
        return this.broadcastCallback(trans.subject).then();
    }
}

class GenericProxyableTable extends ProxyableTable {
    // Refs are stored globally, but numbers start from 1 since tag 0 always
    // gets routed to the specific host service instance.
    private static refs: Proxyable[] = [];
    private static nextTag: number = 1;

    constructor(service: Proxyable) {
        super(service);
    }

    lookup(tag: number) {
        const index = tag - 1;
        if (index in GenericProxyableTable.refs)
            return GenericProxyableTable.refs[index];
        else throw new Error("Rpc Error: Tagged object not in refs");
    }

    getTag(object: Proxyable) {
        if (object.proxyableId == null) {
            object.proxyableId = GenericProxyableTable.nextTag++;
            GenericProxyableTable.refs.push(object);
        }
        return super.getTag(object);
    }
}

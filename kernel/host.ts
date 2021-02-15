import DataSet from "./dataset";
import { Entity, Transaction } from "./entity";
import { Proxy, Proxyable, ProxyableTable, Rpc } from "shared";

export default class Host {
    private clientService: Proxy;
    private rpc: Rpc;

    constructor(private dataset: DataSet, send: (_: string) => void) {
        let hostService = {
            proxyableId: null,
            rootPage: () => dataset.root,
        };
        let table = new DatasetProxyableTable(hostService, dataset);
        this.rpc = new Rpc(table, send);
        this.clientService = this.rpc.foreignObjects.getObject(0);
    }

    receive(message: string) {
        this.rpc.handleWebsocketReceive(message);
    }

    broadcast(trans: Transaction) {
        this.clientService.call("broadcast", [trans.model()]);
    }
}

export class DatasetProxyableTable extends ProxyableTable {
    constructor(service: Proxyable, private dataset: DataSet) {
        super(service);
    }

    lookup(tag: number): Proxyable {
        return this.dataset.lookup(tag);
    }

    getTag(object: Proxyable) {
        if (object.proxyableId == null && object instanceof Entity) {
            object.proxyableId = object.id;
        }
        return super.getTag(object);
    }
}

import DataSet from "./dataset";
import { Entity, Presentation, Backing, Transaction } from "./entity";
import { Proxy, Proxyable, ProxyableTable, Rpc } from "shared";

export default class Host {
    private clientService: Proxy;
    private rpc: Rpc;

    constructor(private ds: DataSet, send: (_: string) => void) {
        let table = new DatasetProxyableTable(new HostService(ds), ds);
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

class HostService extends Proxyable {
    rootPage: () => Entity;
    instantiate: (
        presentation: Presentation,
        backing: Backing,
        backingValue: object
    ) => Entity;

    constructor(private ds: DataSet) {
        super();

        this.rootPage = (() => ds.root).bind(this);
        this.instantiate = ((
            presentation: Presentation,
            backing: Backing,
            backingValue: object
        ) => new Entity(ds, presentation, backing, backingValue)).bind(this);
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
            object.proxyableId = object.id();
        }
        return super.getTag(object);
    }
}

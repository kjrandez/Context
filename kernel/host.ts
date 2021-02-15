import DataSet from "./dataset";
import { Transaction } from "./entity";
import { Proxy, Rpc } from "shared";

export default class Host {
    private clientService: Proxy;
    private rpc: Rpc;

    constructor(private dataset: DataSet, send: (_: string) => void) {
        let hostService = {
            proxyableId: null,
            rootPage: () => dataset.root,
        };
        this.rpc = new Rpc(hostService, send);
        this.clientService = this.rpc.foreignObjects.getObject(0);
    }

    receive(message: string) {
        this.rpc.handleWebsocketReceive(message);
    }

    broadcast(trans: Transaction) {
        console.log("Broadcast:");
        console.log(trans);
        this.clientService.call("broadcast", [trans.model()]);
    }
}

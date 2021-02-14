import {Proxy, Rpc, TransactionModel} from 'shared';

export default class Client extends Rpc
{
    static connect(
        connected: (_: Proxy) => Promise<void>,
        disconnected: () => void,
        broadcast: (_: Proxy) => Promise<void>
    ) {
        let clientService = {
            proxyableId: null,
            broadcast: (trans: TransactionModel) => broadcast(trans.subject).then()
        };
        const websocket = new WebSocket("ws://localhost:8085/broadcast");
        let send = (message: string) => websocket.send(message);
        let client = new Client(clientService, send)
        let hostService = client.foreignObjects.getObject(0);

        websocket.onmessage = (event) => {
            let msg = JSON.parse(event.data);
            client.handleWebsocketReceive(msg);
        }
        websocket.onclose = (_) => disconnected();
        websocket.onopen = (_) => connected(hostService).then();
    }
}

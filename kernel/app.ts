import DataSet from "./dataset";
import Host from "./host";
import WebSocket from "ws";
import Async from "async";
import { Transaction } from "./entity";

const remotes: Host[] = [];

const queue = Async.queue((trans: Transaction, done) => {
    remotes.forEach((remote) => remote.broadcast(trans));
    done(); // Must be called
});

const dataset = new DataSet(queue);

const server = new WebSocket.Server({ path: "/broadcast", port: 8085 });

server.on("connection", (ws) => {
    console.log("Connected");

    const send = (message: string) => ws.send(message);
    const host = new Host(dataset, send);
    remotes.push(host);

    ws.on("message", (msg) => {
        host.receive(msg.toString());
    });

    ws.on("close", (_code, _reason) => {
        const index = remotes.indexOf(host);
        remotes.splice(index, 1);

        console.log("Disconnected");
    });
});

import DataSet from "./dataset";
import Host from "./host";
import WebSocket from "ws";
import fs from "fs";
import http from "http";
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

http.createServer(function (req, res) {
    if (req.url != null) {
        const path = req.url.slice(1);
        console.log("Request");
        console.log(path);
        fs.readFile(path, function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200);
            res.end(data);
        });
    }
}).listen(8086);

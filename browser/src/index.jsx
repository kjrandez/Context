import React from "react";
import ReactDOM from "react-dom";
import App from "./view";
import * as serviceWorker from "./serviceWorker";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";

window.shellRelay = {
    receive: null, // "App" should reassign
    send: (msg) => window.external.notify(msg)
};

window.shellMessage = function (msg) {
    window.shellRelay.receive(msg);
};

ReactDOM.render(
    <DndProvider backend={Backend}>
        <App relay={window.shellRelay} />
    </DndProvider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {App} from './visual';
import Store from './store/Store';

var kernel;
var app;
var store;

function startup(component) {
    console.log("In startup");

    app = component;
    kernel = new WebSocket("ws://localhost:8085/broadcast");

    kernel.onopen = kernelOpen;
    kernel.onclose = kernelClose;
    kernel.onmessage = kernelMessage;
}

function kernelOpen(event) {
    kernel.send(JSON.stringify({
        selector: "requestTopPage",
        arguments: []
    }))
}

function kernelClose(event) {
    alert('Connection closed.');
}

function kernelMessage(event) {
    var message = JSON.parse(event.data);
    console.log("Received message: ");
    console.log(message);
    
    switch(message.selector) {
        case 'renderPage:':
            store.setModel(message.arguments[0]);
            console.log(store.topLevelContent());
            app.setModel(store.topLevelContent());
            break;
        default:
            console.log("Unhandled message");
            break;
    }
}

store = new Store();

ReactDOM.render(<App startup={startup}/>, document.getElementById('root'));
registerServiceWorker();

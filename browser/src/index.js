import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import {Top} from './visual';
import App from './app.js';

var app = new App();
registerServiceWorker();
ReactDOM.render(<Top app={app} />, document.getElementById('root'));

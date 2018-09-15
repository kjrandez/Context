import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {Root} from './visual';
import App from './App.js';

var app = new App();
registerServiceWorker();
ReactDOM.render(<Root app={app} />, document.getElementById('root'));

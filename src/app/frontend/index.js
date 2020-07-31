import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from 'react-router-dom';
import { createHashHistory } from 'history';

import { App } from './App';

import { PersoniumAppProvider } from './lib/AppContext';

const history = createHashHistory();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/__/service_worker.js', { scope: '/__/' })
    .then(function(registration) {
      console.log(
        'ServiceWorker registration successful with scope: ',
        registration.scope
      );
    })
    .catch(function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
}

ReactDOM.render(
  <PersoniumAppProvider>
    <Router history={history}>
      <App />
    </Router>
  </PersoniumAppProvider>,
  document.getElementById('root')
);

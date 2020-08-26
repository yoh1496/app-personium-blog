import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from 'react-router-dom';
import { createHashHistory } from 'history';

import { App } from './App';

import { PersoniumAppProvider } from './lib/AppContext';

const history = createHashHistory();

function getSWParam() {
  if (window.origin === 'https://yoh1496.github.io') {
    return {
      path: '/app-personium-blog/service_worker.js',
      scope: '/app-personium-blog/',
    };
  } else {
    return {
      path: '/__/service_worker.js',
      scope: '/__/',
    };
  }
}
if ('serviceWorker' in navigator) {
  const { path, scope } = getSWParam();
  navigator.serviceWorker
    .register(path, { scope })
    .then(function(registration) {
      // success
      registration.onupdatefound = function() {
        console.log('update found!');
        registration.update();
      };
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

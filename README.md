horse-react
===========

horse-react is an implementation of the
[horse](https://github.com/reddit/horse) application building library, with
some helpers to make working with react easily.

Go check out that documentation, then return to see how you'd use it with
React a little easier.

New APIs
--------

`horse-react` exposes pre-built `render` and `error` functions that you can
hook into, through `ClientApp` and `ServerApp` classes.


A Brief Overview
----------------

An example usage might be like: (es6 incoming)

`routes.es6.js`

```javascript
// This is used both client- and server- side, and simply sets up an app with
// routes; in this case, returning React elements.

import Layout from '../layouts/layout.jsx';
import Index from '../pages/index.jsx';

function setupRoutes(app) {
  app.router.get('/', function *(next) {
    this.layout = Layout;
    var user = yield db.getUser(1);
    this.props = { user };
    this.body = <Index {...this.props} />;

    yield next;
  });
}

export default setupRoutes;
```


`server.es6.js`

```javascript
import koa from 'koa';

import {ServerReactApp} from 'horse-react';
import setupRoutes from './setupRoutes';

var server = koa();

var app = new App();
setupRoutes(app);

server.use(ServerReactApp.serverRender(app));
```

`client.es6.js`

You'll want to add push state too, but that's outside the scope of our
example.

```javascript
import React from 'react';
import {ClientReactApp} from 'horse-react';

import setupRoutes from './setupRoutes';

import jQuery as $ from 'jquery';

var app = new ClientApp();
setupRoutes(app);

app.mountPoint = document.getElementById('app-container');

$(function() {
  $('body').on('click', 'a', function(e) {
    e.preventDefault();
    app.render(this.href);
  });
});
```

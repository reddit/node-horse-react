horse-react
===========

[![Build Status](https://travis-ci.org/reddit/horse-react.svg)](https://travis-ci.org/reddit/horse-react)

horse-react is an implementation of the
[horse](https://github.com/reddit/horse) application building library, with
some helpers to make working with react easily.

Go check out that documentation, then return to see how you'd use it with
React a little easier.

New APIs
--------

`horse-react` exposes pre-built `render` and `error` functions that you can
hook into, through `ClientApp` and `ServerApp` classes. It expects your
middleware to attach a `layout`, `body`, and `props` property to the `context`
object during the course of your route handling, and at the end, it will render
it out (either with `layout`, if on the server, or it will mount the `body` if
on the client.)


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
    this.data = new Map({
      user: db.getUser(1)
    });

    this.layout = Layout;

    this.body = function(props) {
      return <Index {...this.props} />;
    });
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

var app = new ClientApp({
  mountPoint: document.getElementById('app-container')
});

setupRoutes(app);

$(function() {
  $('body').on('click', 'a', function(e) {
    e.preventDefault();
    app.render(this.href);
  });
});
```

Additional Notes
----------------

If you want to mount a client application directly on the server-rendered
markup, add `this.staticMarkup` to the context before `serverRender` is called.
Your `layout` should include `!!CONTENT!!` as the magic word where rendered
body markup should be inserted (instead of `{this.children}`.)

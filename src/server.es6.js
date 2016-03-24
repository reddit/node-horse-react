import React from 'react';
import ReactDOM from 'react-dom/server';
import { App } from 'horse';

class ServerReactApp extends App {
  injectBootstrap (format) {
    return function * () {
      this.props.timings = this.timings;

      var p = Object.assign({}, this.props);

      if (format) {
        p = format(p);
      }

      delete p.app;
      delete p.api;
      delete p.manifest;

      const nonce = p.nonce;
      delete p.nonce;

      p.data = {};

      var bootstrap = ServerReactApp.safeStringify(p);

      var body = this.body;
      var bodyIndex = body.lastIndexOf('</body>');
      var template = `<script nonce='${nonce}'>var bootstrap=${bootstrap}</script>`;
      this.body = body.slice(0, bodyIndex) + template + body.slice(bodyIndex);
    }
  }

  * render () {
    if (typeof this.body === 'function') {
      var Layout = this.layout;
      var props = this.props;
      this.type = 'text/html; charset=utf-8';

      try {
        if (this.staticMarkup) {
          var layout = ReactDOM.renderToStaticMarkup(<Layout {...props } />);
          var body = ReactDOM.renderToString(this.body(props));

          this.body = layout.replace(/!!CONTENT!!/, body);
        } else {
          this.body = ReactDOM.renderToStaticMarkup(
            <Layout {...props}>
              {this.body(props)}
            </Layout>
          );
        }
      } catch (e) {
        this.props.app.error(e, this, this.props.app);
        yield this.props.app.render;
      }
    }
  }

  * loadData() {
    // this.props.data is a map; pass in its keys as an array of promises
    if (this.props.data) {
      return Promise.all([...this.props.data.values()]);
    } else {
      return Promise.resolve();
    }
  }

  static safeStringify (obj) {
    return JSON.stringify(obj)
      .replace(/&/g, '\\u0026')
      .replace(/</g, '\\u003C')
      .replace(/>/g, '\\u003E');
  }

  static serverRender (app, formatProps) {
    return function * () {
      this.timings = {};

      if (this.accepts('html')) {
        var routeStart = Date.now();
        yield app.route(this);
        this.timings.route = Date.now() - routeStart;
      }

      if (typeof this.body === 'function') {
        // Load all the data required for the request before the server renders
        var data;
        this.props = this.props || {};

        try {
          var dataStart = Date.now();
          data = yield app.loadData;
          this.timings.data = Date.now() - dataStart;
        } catch (e) {
          app.error(e, this, app);
        }

        this.props.dataCache = {};

        if (data) {
          // The entries are in the same order as when we fired off the promises;
          // load the data from the response array.
          var i = 0;
          for (var [key, value] of this.props.data.entries()) {
            this.props.dataCache[key] = data[i];
            i++;
          }
        }

        if (this.preServerRender) {
          const preServerRender = this.preServerRender(this);

          // If you explicitly return `false`, don't continue the render.
          if (preServerRender === false) {
            return;
          }
        }

        var renderStart = Date.now();
        yield app.render;
        this.timings.render = Date.now() - renderStart;

        if (formatProps) {
          this.props = formatProps(this.props);
        }

        yield app.injectBootstrap(app.config.formatBootstrap);
      }
    }
  }
}

export default ServerReactApp;

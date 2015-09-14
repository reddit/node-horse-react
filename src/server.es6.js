import React from 'react';
import { App } from 'horse';

class ServerReactApp extends App {
  injectBootstrap (format) {
    return function * () {
      var p = Object.assign({}, this.props);

      if (format) {
        p = format(p);
      }

      delete p.app;
      delete p.api;
      delete p.manifest;
      p.data = {};

      var bootstrap = ServerReactApp.safeStringify(p);

      var body = this.body;
      var bodyIndex = body.lastIndexOf('</body>');
      var template = `<script>var bootstrap=${bootstrap}</script>`;
      this.body = body.slice(0, bodyIndex) + template + body.slice(bodyIndex);
    }
  }

  * render () {
    var Layout = this.layout;
    var props = this.props;

    try {
      if (this.staticMarkup) {
        var layout = React.renderToStaticMarkup(<Layout {...props } />);
        var body = React.renderToString(this.body(props));

        this.body = layout.replace(/!!CONTENT!!/, body);
      } else {
        this.body = React.renderToStaticMarkup(
          <Layout {...props}>
            {this.body(props)}
          </Layout>
        );
      }
    } catch (e) {
      if (this.props.app.config.debug) {
        console.log(e, e.stack);
      }

      this.props.app.error(e, this, this.props.app);
      yield this.props.app.render;
    }

    this.type = 'text/html; charset=utf-8';
  }

  * loadData() {
    // this.props.data is a map; pass in its keys as an array of promises
    return Promise.all([...this.props.data.values()]);
  }

  static safeStringify (obj) {
    return JSON.stringify(obj)
      .replace(/&/g, '\\u0026')
      .replace(/</g, '\\u003C')
      .replace(/>/g, '\\u003E');
  }

  static serverRender (app, formatProps) {
    return function * () {
      if (this.accepts('html')) {
        yield app.route(this);
      }

      if (typeof this.body === 'function') {
        // Load all the data required for the request before the server renders
        var data;
        this.props = this.props || {};

        try {
          data = yield app.loadData;
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

        yield app.render;

        if (formatProps) {
          this.props = formatProps(this.props);
        }

        yield app.injectBootstrap(app.config.formatBootstrap);
      }
    }
  }
}

export default ServerReactApp;

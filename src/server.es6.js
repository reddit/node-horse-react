import React from 'react';
import { App } from 'horse';

class ServerReactApp extends App {
  * injectBootstrap () {
    var p = this.props;

    delete p.app;
    delete p.api;
    delete p.manifest;

    var bootstrap = ServerReactApp.safeStringify(p);

    var body = this.body;
    var bodyIndex = body.lastIndexOf('</body>');
    var template = `<script>var bootstrap=${bootstrap}</script>`;
    this.body = body.slice(0, bodyIndex) + template + body.slice(bodyIndex);
  }

  * render () {
    var Layout = this.layout;
    var props = this.props;

    this.body = React.renderToStaticMarkup(
      <Layout {...props}>
        {this.body}
      </Layout>
    );

    this.type = 'text/html; charset=utf-8';
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

      if (typeof this.body === 'object' && React.isValidElement(this.body)) {
        yield app.render;

        if (formatProps) {
          this.props = formatProps(this.props);
        }

        yield app.injectBootstrap;
      }
    }
  }
}

export default ServerReactApp;

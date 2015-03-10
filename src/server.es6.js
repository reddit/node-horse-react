import React from 'react';
import { App } from 'horse';

class ServerReactApp extends App {
  * injectBootstrap () {
    var p = this.props;

    delete p.app;
    delete p.api;
    delete p.manifest;

    var body = this.body;
    var bodyIndex = body.lastIndexOf('</body>');
    var template = '<script>var bootstrap=' + JSON.stringify(p) + '</script>';
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

  static serverRender (app) {
    return function * () {
      var promise = app.route(this);
      yield promise;

      yield app.render;
      yield app.injectBootstrap;
    }
  }
}

export default ServerReactApp;

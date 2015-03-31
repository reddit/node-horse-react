import React from 'react';
import { ClientApp } from 'horse';

class ClientReactApp extends ClientApp {
  constructor (props={}) {
    super(props);

    if (props.mountPoint) {
      this.mountPoint = props.mountPoint;
    }

    if (window.bootstrap) {
      this.resetState(window.bootstrap);
    }

    this.redirect = this.redirect.bind(this);
  }

  redirect (status, path) {
    if ((typeof status === 'string') && !path) {
      path = status;
    }

    this.render(path);
  }

  buildContext (href) {
    var request = this.buildRequest(href);

    // `this` binding, how does it work
    return {
      redirect: this.redirect,
      error: this.error,
      request: request,
      method: request.method,
      path: request.path,
      query: request.query,
      params: request.params,
      headers: request.headers,
    };
  }

  render (href, firstLoad) {
    var mountPoint = this.mountPoint;

    if (!mountPoint) {
      throw('Please define a `mountPoint` on your ClientApp for the react element to render to.');
    }

    var ctx = this.buildContext(href);

    if (firstLoad) {
      ctx.props = this.getState();
    }

    return new Promise(function(resolve) {
      this.route(ctx).then(function() {
        this.emitter.once('page:update', resolve);
        React.render(ctx.body, mountPoint);
      }.bind(this));
    }.bind(this));
  }
}

export default ClientReactApp;

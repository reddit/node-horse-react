import React from 'react-dom';
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
    const request = this.buildRequest(href);

    // `this` binding, how does it work
    return {
      ...request,
      redirect: this.redirect,
      error: this.error,
    };
  }

  render (href, firstLoad, modifyContext) {
    var mountPoint = this.mountPoint;

    if (!mountPoint) {
      throw('Please define a `mountPoint` on your ClientApp for the react element to render to.');
    }

    var ctx = this.buildContext(href);

    if (modifyContext) {
      var ctx = modifyContext(ctx);
    }

    if (firstLoad) {
      ctx.props = this.getState();
    }

    return new Promise((resolve) => {
      this.route(ctx).then(() => {
        if (ctx.body && typeof ctx.body === 'function') {
          try {
            this.emitter.once('page:update', resolve);
            React.render(ctx.body(ctx.props), mountPoint);
          } catch (e) {
            this.error(e, ctx, this);
          }
        }
      });
    });
  }
}

export default ClientReactApp;

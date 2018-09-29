import { RouteData, RouteHandler, RouteTree, RoutePayload, RouteMethod, RouteMethodHandlers } from './types';
import { StatusCodes } from '../server/statuses';

export default class Route {
  private readonly handler: RouteMethodHandlers | RouteTree;
  private readonly naHandler: RouteHandler;

  constructor(handler: RouteHandler, children?: RouteTree);
  constructor(handlers: RouteMethodHandlers, naHandler: RouteHandler);
  constructor() {
    if (typeof arguments[1] === 'function') {
      this.handler = arguments[0];
      this.naHandler = arguments[1];
    } else {
      this.handler = Route.with(arguments[0], arguments[1]);
      this.naHandler = this.handler;
    }
  }

  public static readonly SeeChildrenHandler = (children: RouteTree) => {
    const routes = Object.keys(children);

    return _ => ({
      status: StatusCodes.Found,
      payload: routes
    });
  };

  public static readonly NotFoundHandler = _ => ({
    status: StatusCodes.NotFound
  });

  /**
   * A little helper for simple nested routes initialization and type-checking.
   * A more optimized way of route initialization that instantiating a Route class.
   *
   * @param tree a routing tree to define the routes by
   * @returns processed route handler
   */
  public static with(tree: RouteTree): RouteTree;
  /**
   * A little helper for simple nested routes initialization and type-checking.
   * A more optimized way of route initialization that instantiating a Route class.
   *
   * @param handler route handler to process
   * @param [children] optional subroutes
   * @returns processed route handler
   */
  public static with(handler: RouteHandler, children?: RouteTree): RouteTree;
  public static with(handler?: RouteHandler | RouteTree, children?: RouteTree): RouteTree {
    if (typeof handler === 'function') {
      if (children) {
        for (const route in children) {
          handler[route] = children[route];
        }
      }

      return handler;
    }

    const tempHandler = handler;
    const newHandler = Route.SeeChildrenHandler(tempHandler);

    for (const route in tempHandler) {
      newHandler[route] = tempHandler[route];
    }

    return newHandler;
  }


  /**
   * Based on https://gist.github.com/Raiondesu/759425dede5b7ff38db51ea5a1fb8f11
   * Returns a route handler from an object by a given path (usually string).
   *
   * @param obj an object to get a value from.
   * @param path to get a value by.
   * @param method to return a specified handler for the method if possible.
   * @param splitter to split the path by. Default is '/' ('route/path/example')
   * @returns a value from a given path. If a path is invalid - returns undefined.
   */
  public static fromPath(routes: RouteTree, path: string | RegExp, method: RouteMethod, splitter?: string): RouteHandler {
    return this._fromPath(routes, path, method, splitter);
  }

  private static _fromPath(
    routes: RouteTree,
    path: string | RegExp,
    method: RouteMethod,
    splitter: string = '/',
    nfHandler: RouteHandler = Route.NotFoundHandler // A default 404 handler
  ): RouteHandler {
    const toHandler = route => {
      if (!route) {
        return nfHandler;
      }

      if (!(route instanceof Route)) {
        return route;
      }

      if (typeof route.handler === 'function') {
        return route.handler;
      }

      if (method in route.handler) {
        return route.handler[method];
      }

      return route.naHandler;
    };

    if (!path)
      return toHandler(routes);

    if (path instanceof RegExp) {
      for (const key in routes) if (path.test(key)) {
        return toHandler(routes[key]);
      }

      return toHandler(routes['*'] || nfHandler);
    }

    const idx = path.indexOf(splitter);

    if (idx === -1)
      return toHandler(routes[path]);

    const key = path.substring(0, idx);

    if (!(key in routes)) {
      return nfHandler;
    }

    const nextPath = path.substr(idx).replace(splitter, '');

    if (!nextPath) {
      return toHandler(routes[key]);
    }

    if (!routes[key]) {
      return nfHandler;
    }

    const nextRoute = toHandler(routes[key]);

    return this._fromPath(
      nextRoute,
      nextPath,
      method,
      splitter,
      nextRoute['*'] || nfHandler
    );
  }
}

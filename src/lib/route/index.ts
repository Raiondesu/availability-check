import { RouteMethod } from './types';
import { StatusCodes } from 'lib/server/statuses';

/**
 * @todo document this shit
 */
export default class Route/* <T extends RouteChildren | undefined = undefined> */ {
  /**
   * @todo document this shit
   */
  private readonly handler/* : RouteMethodHandlers | (T extends undefined ? RouteHandler : RouteTree<T>) */;

  /**
   * @todo document this shit
   */
  private readonly naHandler/* : RouteHandler */;

  /**
   * @todo document this shit
   */
  // constructor(handler: RouteHandler, children?: T);
  // /**
  //  * @todo document this shit
  //  */
  // constructor(handlers: RouteMethodHandlers, naHandler: RouteHandler);
  constructor(handlers/* : RouteMethodHandlers | RouteTree<T> */, naHandlerChildren?/* : RouteHandler | T */) {
    if (typeof arguments[1] === 'function') {
      this.handler = handlers as any;
      this.naHandler = naHandlerChildren/*  as RouteHandler */ || Route.NotAcceptableHandler;
    } else {
      this.handler = Route.with(handlers/*  as RouteTree<T> */, naHandlerChildren/*  as T */);
      this.naHandler = this.handler/*  as RouteTree */;
    }
  }

  /**
   * @todo document this shit
   */
  public get methods(): object | string | string[] {
    if (this.handler !== this.naHandler) {
      const methods = Object.keys(this.handler);

      return methods.length === 1 ? methods[0] : methods;
    } else {
      return Object.keys(this.handler).reduce((obj, key) => {
        obj[key] = Route.SeeChildrenHandler(this.handler[key])({} as any).payload;

        return obj;
      }, {
        '/': 'any'
      } as any);
    }
  }

  /**
   * @todo document this shit
   */
  public static readonly SeeChildrenHandler = (children/* : RouteTree */)/* : RouteHandler */ => _ => {
    let routes = {};

    for (const route in children) {
      if (children[route] instanceof Route) {
        routes[route] = children[route].methods;
      } else {
        routes[route] = (Route.SeeChildrenHandler(children[route])({} as any)/*  as RoutePayload */).payload;
      }
    }

    if (Object.keys(routes).length === 0) {
      routes = 'any';
    }

    return {
      status: StatusCodes.Found,
      payload: routes
    };
  };

  /**
   * @todo document this shit
   */
  public static readonly NotFoundHandler/* : RouteHandler */ = () => ({
    status: StatusCodes.NotFound
  });

  /**
   * @todo document this shit
   */
  public static readonly NotAcceptableHandler/* : RouteHandler */ = () => ({
    status: StatusCodes.NotAcceptable
  });

  /**
   * A little helper for simple nested routes initialization and type-checking.
   * A more optimized way of route initialization that instantiating a Route class.
   *
   * @param tree a routing tree to define the routes by
   * @returns processed route handler
   */
  public static with/* <T extends RouteChildren> */(tree/* : T */)/* : RouteTree<T> */;
  /**
   * A little helper for simple nested routes initialization and type-checking.
   * A more optimized way of route initialization that instantiating a Route class.
   *
   * @param handler route handler to process
   * @param [children] optional subroutes
   * @returns processed route handler
   */
  public static with/* <T extends RouteChildren | undefined = undefined> */(handler/* : RouteHandler */, children?/* : T */)/* : T extends undefined ? RouteHandler : RouteTree<T> */;
  public static with(handler, children?) {
    if (typeof handler === 'function') {
      if (children) {
        for (const route in children) {
          handler[route] = children[route];
        }
      }

      return handler;
    }

    const tempHandler = handler || Route.NotFoundHandler;
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
  public static fromPath(routes/* : RouteTree */, path: string | RegExp, method: RouteMethod, splitter?: string)/* : RouteHandler */ {
    return this._fromPath(routes, path, method, splitter);
  }

  /**
   * @todo document this shit
   */
  private static _fromPath(
    routes/* : RouteTree */,
    path: string | RegExp,
    method: RouteMethod,
    splitter: string = '/',
    nfHandler/* : RouteHandler */ = Route.NotFoundHandler // A default 404 handler
  )/* : RouteHandler */ {
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

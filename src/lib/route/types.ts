/**
 * A collection of types for Route Handlers definitions
 */

import { OutgoingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { StatusCodes } from '../../server/statuses';


export type RouteMethodHandlers = {
  [method in RouteMethod]?: RouteHandler;
};

/**
 * Route Handler Payload
 */
export type RoutePayload<T> = {
  status: StatusCodes;
  payload?: T;
};

/**
 * Route Handler's Request-data
 */
export type RouteData<T = any> = {
  path: string;
  query: ParsedUrlQuery;
  headers: OutgoingHttpHeaders;
  method: string;
  payload: T;
};

/**
 * Route handler type
 */
export type RouteHandler<T = any> = (data: RouteData) => (Promise<RoutePayload<T>> | RoutePayload<T>);


/**
 * Route handler type that allows subroutes
 */
export type RouteTree<T extends undefined | {
  [child: string]: RouteTree;
} = any> = T extends undefined ? RouteHandler : (RouteHandler & T);

export type RouteMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

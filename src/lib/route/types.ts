/**
 * A collection of types for Route Handlers definitions
 */

import { OutgoingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { StatusCodes } from '../server';
import Route from '.';


// export type RouteMethodHandlers = {
//   [method in RouteMethod]?: RouteHandler;
// };

/**
 * Route Handler Payload
 */
// export type RoutePayload<T = any> = {
//   status: StatusCodes;
//   payload?: T;
// };

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
// export interface RouteHandler {
//   // <T = any>(data: RouteData): RoutePayload<T>;
//   <T = any>(data: RouteData): Promise<RoutePayload<T>>;
//   // <T = any>(): Promise<RoutePayload<T>>;
//   <T = any>(): RoutePayload<T>;
// }

/**
 * Route subroutes
 */
// export type RouteChildren = {
//   [child: string]: RouteTree | Route;
// };

/**
 * Route handler type that allows subroutes
 */
// export type RouteTree<T extends undefined | RouteChildren = undefined> = T extends undefined ? RouteHandler : (RouteHandler & T);

export type RouteMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

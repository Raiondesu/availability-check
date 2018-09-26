import { OutgoingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';

/**
 * A collection of types for Route Handlers definitions
 */
export namespace Route {
  /**
   * Route Handler Payload
   */
  export type Payload<T> = {
    status: number;
    payload?: T;
  };

  /**
   * Route Handler's Request-data
   */
  export type Data = {
    path: string;
    query: ParsedUrlQuery;
    headers: OutgoingHttpHeaders;
    payload: any;
  };

  /**
   * Route handler type
   */
  export type Handler<T = any> = ((data: Data) => Promise<Payload<T>>) | {};


  /**
   * Route handler type that allows subroutes
   */
  export type HandlerWithChildren<T extends undefined | {
    [child: string]: HandlerWithChildren;
  } = any> = T extends undefined ? Handler : (Handler & T);

  /**
   * Main route handlers tree interface
   */
  export interface Tree {
    [handler: string]: HandlerWithChildren;
  }
}

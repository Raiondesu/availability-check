import { OutgoingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';

export namespace Route {
  export type Payload<T> = {
    status: number;
    payload?: T;
  };

  export type Data = {
    path: string;
    query: ParsedUrlQuery;
    headers: OutgoingHttpHeaders;
    payload: any;
  };

  export type Handler<T = any> = ((data: Data) => Promise<Payload<T>>) | {};

  export type HandlerWithChildren<T extends undefined | {
    [child: string]: HandlerWithChildren;
  } = any> = T extends undefined ? Handler : (Handler & T);

  export interface Tree {
    [handler: string]: HandlerWithChildren;
  }
}

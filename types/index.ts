export namespace Route {
  export type Payload<T> = {
    status: number;
    payload?: T;
  };

  export type Handler<T = any> = ((data: any) => Promise<Payload<T>>) | {};

  export type HandlerWithChildren<T extends undefined | {
    [child: string]: HandlerWithChildren;
  } = any> = T extends undefined ? Handler : (Handler & T);

  export interface Tree {
    [handler: string]: HandlerWithChildren;
  }
}

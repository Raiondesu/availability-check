import { Server as InsecureServer, IncomingMessage, ServerResponse } from 'http';
import { createServer, Server as SecureServer, ServerOptions } from 'https';
import { parse as parseUrl } from 'url';
import { StringDecoder } from 'string_decoder';
import { readFileSync } from 'fs';

import { fromPath } from './util';
import { Route } from './types';
import config from './config';

export default class Server {
  private internalServer!: InsecureServer | SecureServer;

  public get port() {
    return this._port;
  }
  public set port(v: number) {
    this.internalServer.removeAllListeners();
    this.listenEndCallback();
    this._port = v;
    this.internalServer.listen(v, this.listenStartCallback);
  }

  public get protocol() {
    return this._protocol;
  }
  public set protocol(p: 'http' | 'https') {
    this.listenEndCallback();
    this._protocol = p;
    this.internalServer.removeAllListeners();
    this.initServer(p, this.port, this.routes, this.httpsConfig);
  }

  constructor(protocol: 'http', port: number, routes: Route.Tree);
  constructor(protocol: 'https', port: number, routes: Route.Tree, httpsConfig?: ServerOptions);
  constructor(
    private _protocol: 'http' | 'https',
    private _port: number,
    public readonly routes: Route.Tree,
    private readonly httpsConfig?: ServerOptions
  ) {
    this.initServer(_protocol, _port, routes, httpsConfig);
  }

  private initServer(protocol: 'https' | 'http', port: number, routes: Route.Tree, httpsConfig?: ServerOptions) {
    if (protocol === 'https') {

      this.internalServer = createServer({
        key: readFileSync('./https/key.pem'),
        cert: readFileSync('./https/cert.pem'),
        ...(httpsConfig || {})
      }, Server.Initialize(routes));

    } else {

      this.internalServer = new InsecureServer(Server.Initialize(routes));

    }

    this.internalServer.listen(port, this.listenStartCallback);
  }

  private listenStartCallback = () => {
    console.log(`Server listening on port ${this._port} under ${config.env} ${this._protocol}.`);
  };

  private listenEndCallback = () => {
    console.log(`Server stopped listening on port ${this._port} under ${config.env} ${this._protocol}.`);
  };

  private static Initialize = (routes: Route.Tree) => (req: IncomingMessage, res: ServerResponse) => {
    // Get url and parse it
    const parsedUrl = parseUrl(req.url || '', true);

    // Get path and query params
    const trimmedPath = parsedUrl.pathname!.replace(/(^\/+)|(\/+$)/g, '');
    const query = parsedUrl.query;

    // Get request method
    const method = req.method!;

    // Get headers as object
    const headers = req.headers;

    // Parse payload if any
    const decoder = new StringDecoder('UTF-8');

    let buffer = '';

    req.addListener('data', chunk => {
      buffer += decoder.write(chunk);
    });

    req.addListener('end', async () => {
      buffer += decoder.end();

      // Choose the route handler
      const handler = fromPath(routes, trimmedPath, '/') || routes['*'];

      // Construct data to send to the handler
      const data = {
        trimmedPath,
        query,
        headers,
        payload: buffer
      };

      // Route the request to the handler
      const handlerData = await handler(data);

      const statusCode = typeof handlerData.status === 'number' ? handlerData.status : 200;

      const payloadString = JSON.stringify(handlerData.payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log(`${statusCode}: Returning %s to %s %s`, payloadString, method, trimmedPath);
    });
  };
}

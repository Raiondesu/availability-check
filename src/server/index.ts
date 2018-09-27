/**
 * Server abstraction file
 */

import { Server as InsecureServer, IncomingMessage, ServerResponse } from 'http';
import { createServer, Server as SecureServer, ServerOptions } from 'https';
import { parse as parseUrl } from 'url';
import { StringDecoder } from 'string_decoder';
import { readFileSync } from 'fs';

import { fromPath } from '../util';
import { Route } from '../types';
import config from '../config';
import { StatusCodes } from './statuses';

/**
 * Incapsulates the functionality behind http.Server and https.Server
 */
export default class Server {
  /**
   * Serves as internal server storage
   */
  private internalServer!: InsecureServer | SecureServer;

  /**
   * Publicly available configured server port
   *
   * Relaunches server upon manual change
   */
  public get port() {
    return this._port;
  }
  public set port(v: number) {
    this.internalServer.removeAllListeners();
    this.listenEndCallback();
    this._port = v;
    this.internalServer.listen(v, this.listenStartCallback);
  }

  /**
   * Publicly available configured server protocol
   *
   * Relaunches server upon manual change
   */
  public get protocol() {
    return this._protocol;
  }
  public set protocol(p: 'http' | 'https') {
    this.listenEndCallback();
    this._protocol = p;
    this.internalServer.removeAllListeners();
    this.initServer(p, this.port, this.routes, this.httpsConfig);
  }

  /**
   * Creates an instance of Server.
   * @param protocol a protocol to serve by
   * @param port a port to listen to
   * @param routes a tree of routes available for requesting
   */
  constructor(protocol: 'http', port: number, routes: Route.Tree);
  /**
   * Creates an instance of Server.
   * @param protocol a protocol to serve by
   * @param port a port to listen to
   * @param routes a tree of routes available for requesting
   * @param httpsConfig a config to pass if launching with https protocol
   */
  constructor(protocol: 'https', port: number, routes: Route.Tree, httpsConfig?: ServerOptions);
  constructor(
    private _protocol: 'http' | 'https',
    private _port: number,
    public readonly routes: Route.Tree,
    private readonly httpsConfig?: ServerOptions
  ) {
    this.initServer(_protocol, _port, routes, httpsConfig);
  }


  /**
   * Inits server with respect to constructor parameters
   */
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

  /**
   * A callback to execute upon starting the server
   */
  private listenStartCallback = () => {
    console.log(`Server listening on port ${this._port} under ${config.env} ${this._protocol}.`);
  };


  /**
   * A callback to execute upon stopping the server
   */
  private listenEndCallback = () => {
    console.log(`Server stopped listening on port ${this._port} under ${config.env} ${this._protocol}.`);
  };

  /**
   * Server initializer factory function
   *
   * @param routes route handlers to bake into the server initializer
   */
  private static Initialize = (routes: Route.Tree) => (req: IncomingMessage, res: ServerResponse) => {
    // Get url and parse it
    const parsedUrl = parseUrl(req.url || '', true);

    // Get path and query params
    const trimmedPath = (parsedUrl.pathname || '').replace(/(^\/+)|(\/+$)/g, '');
    const query = parsedUrl.query;

    // Get request method
    const method = (req.method || 'GET').toUpperCase();

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

      let payload;

      // Parse payload based on content type
      if (req.headers['content-type'] === 'application/json') {
        try {
          // Automatically parse payload if possible
          payload = JSON.parse(buffer);

          if (typeof payload !== 'object') {
            throw new TypeError();
          }
        } catch (e) {
          // Emit error if content-type not valid
          res.writeHead(StatusCodes.BadRequest);
          res.end(String(e));

          console.log(`${StatusCodes.BadRequest}: Returning to %s %s`, method, trimmedPath);

          return;
        }
      } else {
        payload = buffer;
      }

      // Construct data to send to the handler
      const data: Route.Data = {
        path: trimmedPath,
        query,
        headers,
        method,
        payload
      };

      try {
        // Route the request to the handler
        const handlerData = await handler(data);

        const statusCode: StatusCodes = typeof handlerData.status === 'number' ? handlerData.status : StatusCodes.OK;
        const payloadString: string = typeof handlerData.payload === 'string' ? handlerData.payload : JSON.stringify(handlerData.payload);

        if (typeof handlerData.payload === 'object') {
          res.setHeader('Content-Type', 'application/json');
        } else {
          res.setHeader('Content-Type', 'text/plain');
        }

        res.writeHead(statusCode);
        res.end(payloadString);

        console.log(`${statusCode}: %s; %s %s`, payloadString, method, trimmedPath);
      } catch (e) {
        res.writeHead(StatusCodes.InternalServerError);
        res.end(String(e));
      }
    });
  };
}

/**
 * Entry API file
 */

import Server from 'lib/server';
import routes from 'routes';
import config from 'config';

// Launch HTTP server
const httpServer = new Server('http', config.httpPort, routes);

// Launch HTTPS server
const httpsServer = new Server('https', config.httpsPort, routes);

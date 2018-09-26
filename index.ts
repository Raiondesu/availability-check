/**
 * Entry API file
 */

import config from './src/config';
import Server from './src/server';
import routes from './src/routes';

// Launch HTTP server
const httpServer = new Server('http', config.httpPort, routes);

// Launch HTTPS server
const httpsServer = new Server('https', config.httpsPort, routes);

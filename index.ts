/**
 * Entry API file
 */

import Server from './src/lib/server';
import config from './src/config';
import routes from './src/routes';

// Launch HTTP server
const httpServer = new Server('http', config.httpPort, routes);

// Launch HTTPS server
const httpsServer = new Server('https', config.httpsPort, routes);

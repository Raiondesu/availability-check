/**
 * Entry API file
 */

import config from './src/config';
import Server from './src/server';
import routes from './src/routes';

const httpServer = new Server('http', config.httpPort, routes);
const httpsServer = new Server('https', config.httpsPort, routes);

import '../.env.ts';

/**
 * Entry API file
 */

import config from './config';
import Server from './server';
import routes from './routes';

const httpServer = new Server('http', config.httpPort, routes);
const httpsServer = new Server('https', config.httpsPort, routes);

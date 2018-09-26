/**
 * Main route handlers configuration file
 */

import { Route } from './types';
import { route } from './util';

export default {
  // Sample handler
  'sample': route(_data => ({
    status: 406,
    payload: { name: 'Sample handler' }
  }), {
    'test': _data => ({
      status: 200,
      payload: { test: 'Test 2-nd level sample handler' }
    })
  }),

  // Hello handler
  // Returns a greeting string with a name (if stated)
  'hello': route(data => ({
    status: 200,
    payload: `Hello to you too, ${data.query.name || 'stranger'}!\n`
  })),

  // Pings the server for uptime
  'ping': _ => ({ status: 200 }),

  // 404 handler
  '*': _ => ({ status: 404 })
} as Route.Tree;

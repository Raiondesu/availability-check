/**
 * Main route handlers configuration file
 */

import { Route } from '../types';
import { route } from '../util';

// Complex handlers
import users from './handlers/users';
import { StatusCodes } from '../server/statuses';

export default {
  // Users handler
  users,

  // Sample handler
  'sample': route(_data => ({
    status: StatusCodes.NotAcceptable,
    payload: { name: 'Sample handler' }
  }), {
    'test': _data => ({
      status: StatusCodes.OK,
      payload: { test: 'Test 2-nd level sample handler' }
    })
  }),

  // Hello handler
  // Returns a greeting string with a name (if stated)
  'hello': route(data => ({
    status: StatusCodes.OK,
    payload: `Hello to you too, ${data.query.name || 'stranger'}!`
  })),

  // Pings the server for uptime
  'ping': _ => ({ status: StatusCodes.OK }),

  // 404 handler
  '*': _ => ({ status: StatusCodes.NotFound })
} as Route.Tree;

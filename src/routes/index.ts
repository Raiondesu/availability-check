/**
 * Main route handlers configuration file
 */

import Route from '../lib/route';
import { StatusCodes } from '../server/statuses';

// Complex handlers
import users from './handlers/users';

// Export final routing tree
const routeTree = {
  // Users handler
  users,

  // Sample handler
  'sample': new Route(_data => ({
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
  'hello': Route.with(data => ({
    status: StatusCodes.OK,
    payload: `Hello to you too, ${data.query.name || 'stranger'}!`
  })),

  // Just a little joke
  'who-are-you': _ => ({ status: StatusCodes.Teapot }),

  // Pings the server for uptime
  'ping': _ => ({ status: StatusCodes.OK }),

  // 404 handler
  '*': _ => ({ status: StatusCodes.NotFound })
};

export default Route.with(routeTree);

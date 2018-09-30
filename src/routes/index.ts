/**
 * Main route handlers configuration file
 */

import Route from 'lib/route';
import { StatusCodes } from 'lib/server';

// Complex handlers
import users from './handlers/users';
import {/*  RouteHandler, */ RoutePayload } from 'lib/route/types';

// Export final routing tree
export default Route.with({
  // Users handler
  users,

  // Sample handler
  'sample': new Route(() => ({
    status: StatusCodes.NotAcceptable,
    payload: { name: 'Sample handler' }
  }), {
    'test': _ => ({
      status: StatusCodes.OK,
      payload: { test: 'Test 2-nd level sample handler' }
    })
  }),

  // Hello handler
  // Returns a greeting string with a name (if stated)
  'hello': Route.with(_ => ({
    status: StatusCodes.OK,
    payload: `Hello to you too, ${_.query.name || 'stranger'}!`
  })),

  // Just a little joke
  'who-are-you': _ => ({
    status: StatusCodes.Teapot,
    payload: `I'm a teapot.`
  }),

  // Pings the server for uptime
  'ping': _ => ({ status: StatusCodes.OK }),

  // 404 handler
  '*': _ => ({ status: StatusCodes.NotFound })
});

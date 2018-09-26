import { Route } from './types';
import { route } from './misc';

export default {
  // Sample handler
  'sample': route(_data => ({
    status: 406,
    payload: {
      name: 'Sample handler'
    }
  }), {
    'test': _data => ({
      status: 200,
      payload: {
        test: 'Test 2-nd level handler'
      }
    })
  }),

  'ping': _ => ({ status: 200 }),

  // 404 handler
  '*': () => ({ status: 404 })
} as Route.Tree;

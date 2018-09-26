/**
 * App configuration file
 */

const configs = {
  staging: {
    httpPort: 3000,
    httpsPort: 3001,
  },

  production: {
    httpPort: 5000,
    httpsPort: 5001,
  }
};

// List of all supported envs
const envs = Object.keys(configs);

// Default env is the first one
let env = envs[0];

if (process.env.NODE_ENV && process.env.NODE_ENV in configs) {
  env = process.env.NODE_ENV;
} else {
  // If current NODE_ENV is incorrect - reassign it
  process.env.NODE_ENV = env;
}

export default { env, ...configs[env] };

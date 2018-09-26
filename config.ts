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

const envs = Object.keys(configs);
let env = envs[0];

if (process.env.NODE_ENV && process.env.NODE_ENV in configs) {
  env = process.env.NODE_ENV;
} else {
  process.env.NODE_ENV = env;
}

export default { env, ...configs[env] };

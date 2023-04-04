export type NodeEnv = 'development'| 'production' | 'test';

interface Environment {
  baseClientUrl: string,
  baseSocketUrl: string,
}

const environment: { [_ in NodeEnv]: Environment } = {
  development: {
    baseClientUrl: 'http://localhost:3000',
    baseSocketUrl: 'ws://localhost:8080',
  },
  production: {
    baseClientUrl: `https://${window.location.host}`,
    baseSocketUrl: `wss://${window.location.host}`,
  },
  test: {
    baseClientUrl: 'http://localhost:3000',
    baseSocketUrl: 'ws://localhost:8080',
  },
};

export default environment[process.env.NODE_ENV as NodeEnv];

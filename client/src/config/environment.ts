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
    baseClientUrl: `http://${window.location.host}`,
    baseSocketUrl: `ws://${window.location.host}`,
  },
  test: {
    baseClientUrl: '',
    baseSocketUrl: '',
  },
};

export default environment[process.env.NODE_ENV as NodeEnv];

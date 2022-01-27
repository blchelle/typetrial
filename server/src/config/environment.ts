export type NodeEnv = 'production' | 'development';

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number;
}

interface Environment {
  clientUrls: string[];
  rateLimits: RateLimitConfig[];
}

const environment: { [_ in NodeEnv]: Environment } = {
  development: {
    clientUrls: ['http://localhost:3000'],
    rateLimits: [
      {
        maxRequests: 5,
        timeWindow: 1000, // 1 Second
      },
      {
        maxRequests: 60,
        timeWindow: 1000 * 60, // 1 Minute
      },
    ],
  },
  production: {
    clientUrls: [],
    rateLimits: [
      {
        maxRequests: 3,
        timeWindow: 1000, // 1 Second
      },
      {
        maxRequests: 20,
        timeWindow: 1000 * 60, // 1 Minute
      },
    ],
  },
};

export default environment[process.env.NODE_ENV as NodeEnv];
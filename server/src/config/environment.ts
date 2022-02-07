import dotenv from 'dotenv';

export type NodeEnv = 'production' | 'development';

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number;
}

interface JWTConfig {
  secret: string;
  expiryTime: number;
  secure: boolean;
}

interface Environment {
  clientUrls: string[];
  rateLimits: RateLimitConfig[];
  jwt: JWTConfig;
}

// Must load the .env file before initializing the environment
dotenv.config({ path: `${__dirname}/../../.env.${process.env.NODE_ENV as NodeEnv}` });

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
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiryTime: 60 * 60 * 24 * 365, // 1 Year
      secure: false,
    },
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
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiryTime: 60 * 60 * 24 * 7, // 7 Days
      secure: true,
    },
  },
};

export default environment[process.env.NODE_ENV as NodeEnv];

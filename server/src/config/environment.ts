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

interface MailerConfig {
  apiKey: string
  username: string
  resetPasswordTemplateId: string
}

interface Environment {
  baseClientUrl: string,
  clientUrls: string[];
  rateLimits: RateLimitConfig[];
  jwt: JWTConfig;
  mailer?: MailerConfig // Wont exist in development
}

// Must load the .env file before initializing the environment
dotenv.config({ path: `${__dirname}/../../.env.${process.env.NODE_ENV as NodeEnv}` });

const environment: { [_ in NodeEnv]: Environment } = {
  development: {
    baseClientUrl: 'http://localhost:3000',
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
    baseClientUrl: 'http://3.16.27.120:8080',
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
    mailer: {
      apiKey: process.env.MAILER_API_KEY!,
      username: process.env.MAILER_USERNAME!,
      resetPasswordTemplateId: 'd-803b3420888a4b16be882f3231efbc65',
    },
  },
};

export default environment[process.env.NODE_ENV as NodeEnv];

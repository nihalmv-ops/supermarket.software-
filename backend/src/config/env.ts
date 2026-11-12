import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val < 65536, {
      message: 'PORT must be a valid port number (1-65535)',
    }),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  MONGODB_URI: z
    .string()
    .optional()
    .default('mongodb://127.0.0.1:27017/silver_business_suite'),
  CLIENT_URL: z
    .string()
    .default('http://localhost:5173'),
  API_PREFIX: z
    .string()
    .default('/api'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('900000') // 15 minutes
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z
    .string()
    .default('100') // 100 requests per window
    .transform((val) => parseInt(val, 10)),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .default('silver_business_suite_access_secret_token_secure_key_2026'),
  JWT_EXPIRES_IN: z
    .string()
    .default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .default('silver_business_suite_refresh_secret_token_secure_key_2026'),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .default('7d'),
  COOKIE_SECRET: z
    .string()
    .default('silver_business_suite_cookie_secret_key_2026'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ [Config Error] Invalid environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Environment configuration validation failed');
  }
  return result.data;
};

export const env = parseEnv();
export type Environment = z.infer<typeof envSchema>;

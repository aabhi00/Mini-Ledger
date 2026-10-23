import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES ?? 5),
  nodeEnv: process.env.NODE_ENV ?? 'development',
};

if (!Number.isInteger(env.port) || env.port < 1 || !Number.isFinite(env.otpTtlMinutes) || env.otpTtlMinutes <= 0) {
  throw new Error('PORT and OTP_TTL_MINUTES must be positive numbers.');
}

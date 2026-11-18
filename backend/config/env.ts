import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  upstreamBaseUrl: string;
  upstreamApiKey: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  requestTimeoutMs: number;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config: AppConfig = {
  port: parsePositiveInt(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  upstreamBaseUrl: (process.env.LAKIYA_API_BASE_URL || 'https://zara.laksidu.site').replace(/\/+$/, ''),
  upstreamApiKey: (process.env.LAKIYA_API_KEY || '').trim(),
  rateLimitWindowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMaxRequests: parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 120),
  requestTimeoutMs: 15_000,
};

export function isApiKeyConfigured(): boolean {
  return Boolean(
    config.upstreamApiKey &&
      config.upstreamApiKey !== 'YOUR_API_KEY_HERE' &&
      config.upstreamApiKey.length > 8,
  );
}

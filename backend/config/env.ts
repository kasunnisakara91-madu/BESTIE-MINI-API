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

function cleanEnvValue(raw: string | undefined): string {
  if (!raw) return '';
  return raw.trim().replace(/^["']|["']$/g, '');
}

export const config: AppConfig = {
  port: parsePositiveInt(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  upstreamBaseUrl: (cleanEnvValue(process.env.LAKIYA_API_BASE_URL) || 'https://zara.laksidu.site').replace(/\/+$/, ''),
  upstreamApiKey: cleanEnvValue(process.env.LAKIYA_API_KEY),
  rateLimitWindowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMaxRequests: parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 120),
  requestTimeoutMs: 28_000,
};

export function isApiKeyConfigured(): boolean {
  return Boolean(
    config.upstreamApiKey &&
      config.upstreamApiKey !== 'lakiya_6997a3ed7498d2a6415c35e276493a72ea8a087bb8207263f0b21431c0c24f02' &&
      config.upstreamApiKey.length > 8,
  );
}

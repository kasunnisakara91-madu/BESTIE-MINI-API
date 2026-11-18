import { config, isApiKeyConfigured } from '../config/env.ts';
import { metricsStore, type UpstreamHealthState } from '../utils/metricsStore.ts';
import { scrubSensitiveText } from '../utils/sanitize.ts';

const HEALTH_CACHE_TTL_MS = 15_000;
let lastProbeTimestamp = 0;
let inflightProbe: Promise<UpstreamHealthState> | null = null;

export async function checkUpstreamHealth(forceRefresh = false): Promise<UpstreamHealthState> {
  const now = Date.now();
  if (
    !forceRefresh &&
    metricsStore.upstreamHealth.lastCheckedAt !== null &&
    now - lastProbeTimestamp < HEALTH_CACHE_TTL_MS
  ) {
    return metricsStore.upstreamHealth;
  }

  if (inflightProbe) {
    return inflightProbe;
  }

  inflightProbe = (async (): Promise<UpstreamHealthState> => {
    const start = performance.now();
    try {
      const response = await fetch(config.upstreamBaseUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(6_000),
        headers: {
          'User-Agent': 'BESTIE-MINI-API-HealthCheck/1.0',
        },
      });
      const latencyMs = Math.round(performance.now() - start);
      const isUp = response.status >= 200 && response.status < 500;

      const state: UpstreamHealthState = {
        status: isUp ? 'ONLINE' : 'OFFLINE',
        latencyMs,
        lastCheckedAt: new Date().toISOString(),
        statusCode: response.status,
        reason: isUp
          ? isApiKeyConfigured()
            ? 'Upstream provider reachable and API key configured'
            : 'Upstream reachable (LAKIYA_API_KEY not configured)'
          : `Upstream returned HTTP ${response.status}`,
      };

      metricsStore.upstreamHealth = state;
      lastProbeTimestamp = Date.now();
      return state;
    } catch (error) {
      const latencyMs = Math.round(performance.now() - start);
      const reason = scrubSensitiveText(
        error instanceof Error ? error.message : 'Unable to reach upstream API provider',
      );
      const state: UpstreamHealthState = {
        status: 'OFFLINE',
        latencyMs,
        lastCheckedAt: new Date().toISOString(),
        statusCode: null,
        reason,
      };
      metricsStore.upstreamHealth = state;
      lastProbeTimestamp = Date.now();
      return state;
    } finally {
      inflightProbe = null;
    }
  })();

  return inflightProbe;
}

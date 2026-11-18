import type { Request, Response } from 'express';
import type { ApiEndpointDefinition } from '../config/endpoints.ts';
import { config, isApiKeyConfigured } from '../config/env.ts';
import { metricsStore } from '../utils/metricsStore.ts';
import { buildQuerySummary, scrubSensitiveText } from '../utils/sanitize.ts';

export async function forwardToUpstream(
  endpoint: ApiEndpointDefinition,
  req: Request,
  res: Response,
): Promise<void> {
  const start = performance.now();
  const querySummary = buildQuerySummary(req.query as Record<string, unknown>);

  if (!isApiKeyConfigured()) {
    const responseTimeMs = Math.round(performance.now() - start);
    const message =
      'Server configuration error: LAKIYA_API_KEY is not configured in environment variables.';

    metricsStore.recordRequest({
      method: req.method,
      endpoint: endpoint.path,
      querySummary,
      status: 503,
      success: false,
      responseTimeMs,
      errorMessage: message,
    });

    res.status(503).json({
      success: false,
      status: 503,
      endpoint: endpoint.path,
      responseTimeMs,
      timestamp: new Date().toISOString(),
      error: {
        code: 'UPSTREAM_AUTH_NOT_CONFIGURED',
        message,
      },
    });
    return;
  }

  const upstreamUrl = new URL(`${config.upstreamBaseUrl}${endpoint.upstreamPath}`);

  // Forward validated query parameters (never allow client-supplied api_key override)
  for (const [key, rawVal] of Object.entries(req.query)) {
    if (key.toLowerCase() === 'api_key') continue;
    if (rawVal === undefined || rawVal === null) continue;
    const val = Array.isArray(rawVal) ? String(rawVal[0]) : String(rawVal);
    if (val.trim() !== '') {
      upstreamUrl.searchParams.set(key, val.trim());
    }
  }

  // Authenticate strictly on the server using ?api_key=
  upstreamUrl.searchParams.set('api_key', config.upstreamApiKey);

  try {
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(config.requestTimeoutMs),
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BESTIE-MINI-API-Gateway/1.0',
      },
    });

    const responseTimeMs = Math.round(performance.now() - start);
    const rawBody = await upstreamRes.text();

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      const safeSnippet = scrubSensitiveText(rawBody.slice(0, 300));
      const status = upstreamRes.ok ? 502 : upstreamRes.status;
      const errorMessage = `Upstream returned non-JSON response (HTTP ${upstreamRes.status})`;

      metricsStore.recordRequest({
        method: req.method,
        endpoint: endpoint.path,
        querySummary,
        status,
        success: false,
        responseTimeMs,
        errorMessage,
      });

      res.status(status).json({
        success: false,
        status,
        endpoint: endpoint.path,
        responseTimeMs,
        timestamp: new Date().toISOString(),
        error: {
          code: 'UPSTREAM_INVALID_RESPONSE',
          message: errorMessage,
          details: safeSnippet || null,
        },
      });
      return;
    }

    const upstreamStatusFalse =
      typeof parsedBody === 'object' &&
      parsedBody !== null &&
      'status' in parsedBody &&
      (parsedBody as { status: unknown }).status === false;

    if (!upstreamRes.ok || upstreamStatusFalse) {
      const status = !upstreamRes.ok ? upstreamRes.status : 502;
      const upstreamMsg =
        typeof parsedBody === 'object' &&
        parsedBody !== null &&
        'message' in parsedBody &&
        typeof (parsedBody as { message: unknown }).message === 'string'
          ? scrubSensitiveText((parsedBody as { message: string }).message)
          : `Upstream error (HTTP ${upstreamRes.status})`;

      metricsStore.recordRequest({
        method: req.method,
        endpoint: endpoint.path,
        querySummary,
        status,
        success: false,
        responseTimeMs,
        errorMessage: upstreamMsg,
      });

      res.status(status).json({
        success: false,
        status,
        endpoint: endpoint.path,
        responseTimeMs,
        timestamp: new Date().toISOString(),
        error: {
          code: 'UPSTREAM_ERROR',
          message: upstreamMsg,
        },
        data: parsedBody,
      });
      return;
    }

    metricsStore.recordRequest({
      method: req.method,
      endpoint: endpoint.path,
      querySummary,
      status: upstreamRes.status,
      success: true,
      responseTimeMs,
    });

    res.status(upstreamRes.status).json({
      success: true,
      status: upstreamRes.status,
      endpoint: endpoint.path,
      responseTimeMs,
      timestamp: new Date().toISOString(),
      data: parsedBody,
    });
  } catch (error) {
    const responseTimeMs = Math.round(performance.now() - start);
    const isTimeout =
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError');
    const status = isTimeout ? 504 : 502;
    const message = isTimeout
      ? `Upstream request timed out after ${config.requestTimeoutMs}ms`
      : scrubSensitiveText(
          error instanceof Error ? error.message : 'Failed to connect to upstream API provider',
        );

    metricsStore.recordRequest({
      method: req.method,
      endpoint: endpoint.path,
      querySummary,
      status,
      success: false,
      responseTimeMs,
      errorMessage: message,
    });

    res.status(status).json({
      success: false,
      status,
      endpoint: endpoint.path,
      responseTimeMs,
      timestamp: new Date().toISOString(),
      error: {
        code: isTimeout ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNREACHABLE',
        message,
      },
    });
  }
}

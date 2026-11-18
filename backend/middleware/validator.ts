import type { NextFunction, Request, Response } from 'express';
import type { ApiEndpointDefinition } from '../config/endpoints.ts';
import { metricsStore } from '../utils/metricsStore.ts';
import { buildQuerySummary } from '../utils/sanitize.ts';

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateEndpointParams(endpoint: ApiEndpointDefinition) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = performance.now();
    const missing: string[] = [];
    const invalid: string[] = [];

    for (const param of endpoint.params) {
      const rawValue = req.query[param.name];
      const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

      if (param.required && (value === undefined || value === null || String(value).trim() === '')) {
        missing.push(param.name);
        continue;
      }

      if (value !== undefined && String(value).trim() !== '') {
        const strVal = String(value).trim();
        if (param.type === 'url' && !isValidHttpUrl(strVal)) {
          invalid.push(`${param.name} must be a valid http:// or https:// URL`);
        }
        if (strVal.length > 2048) {
          invalid.push(`${param.name} exceeds maximum length of 2048 characters`);
        }
      }
    }

    if (missing.length > 0 || invalid.length > 0) {
      const responseTimeMs = Math.round(performance.now() - start);
      const parts: string[] = [];
      if (missing.length > 0) {
        parts.push(`Missing required query parameter(s): ${missing.join(', ')}`);
      }
      if (invalid.length > 0) {
        parts.push(`Invalid parameter(s): ${invalid.join('; ')}`);
      }
      const message = parts.join('. ');

      metricsStore.recordRequest({
        method: req.method,
        endpoint: endpoint.path,
        querySummary: buildQuerySummary(req.query as Record<string, unknown>),
        status: 400,
        success: false,
        responseTimeMs,
        errorMessage: message,
      });

      res.status(400).json({
        success: false,
        status: 400,
        endpoint: endpoint.path,
        responseTimeMs,
        timestamp: new Date().toISOString(),
        error: {
          code: 'INVALID_PARAMETERS',
          message,
          requiredParams: endpoint.params.map((p) => ({
            name: p.name,
            type: p.type,
            required: p.required,
            example: p.example,
          })),
        },
      });
      return;
    }

    next();
  };
}

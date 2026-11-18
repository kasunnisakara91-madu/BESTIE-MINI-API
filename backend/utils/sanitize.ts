import { config } from '../config/env.ts';

export function scrubSensitiveText(input: string): string {
  if (!input) return input;
  let output = input;
  if (config.upstreamApiKey) {
    output = output.split(config.upstreamApiKey).join('[REDACTED]');
  }
  // Redact any api_key query param value if present in a URL string
  output = output.replace(/([?&]api_key=)[^&\s]+/gi, '$1[REDACTED]');
  return output;
}

export function buildQuerySummary(query: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(query)) {
    if (k.toLowerCase() === 'api_key') continue;
    if (v === undefined || v === null) continue;
    const str = String(v);
    parts.push(`${k}=${str.length > 60 ? `${str.slice(0, 57)}...` : str}`);
  }
  return parts.join('&') || '(none)';
}

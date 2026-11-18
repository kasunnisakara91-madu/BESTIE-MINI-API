import type {
  EndpointsResponse,
  HistoryItem,
  LogsResponse,
  ProxyExecutionResult,
  SystemStatusResponse,
} from '../types/api';

const HISTORY_STORAGE_KEY = 'bestie_mini_api_history_v1';
const MAX_HISTORY_ITEMS = 25;

export async function fetchSystemStatus(refresh = false): Promise<SystemStatusResponse> {
  const url = refresh ? '/api/system/status?refresh=true' : '/api/system/status';
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch system status (HTTP ${res.status})`);
  }
  return res.json() as Promise<SystemStatusResponse>;
}

export async function fetchEndpointsRegistry(): Promise<EndpointsResponse> {
  const res = await fetch('/api/system/endpoints', {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to load endpoint registry (HTTP ${res.status})`);
  }
  return res.json() as Promise<EndpointsResponse>;
}

export async function fetchSystemLogs(filter: 'all' | 'errors' = 'all'): Promise<LogsResponse> {
  const res = await fetch(`/api/system/logs?filter=${filter}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to load logs (HTTP ${res.status})`);
  }
  return res.json() as Promise<LogsResponse>;
}

export async function clearBackendLogs(): Promise<void> {
  const res = await fetch('/api/system/logs', {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to clear logs (HTTP ${res.status})`);
  }
}

export function buildGatewayUrl(
  path: string,
  params: Record<string, string>,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v.trim() !== '') {
      search.set(k, v.trim());
    }
  }
  const qs = search.toString();
  return `${origin}${path}${qs ? `?${qs}` : ''}`;
}

export async function executeProxyRequest(
  path: string,
  params: Record<string, string>,
): Promise<ProxyExecutionResult> {
  const relativeUrl = buildGatewayUrl(path, params, '');
  const fullUrl = buildGatewayUrl(path, params);
  const start = performance.now();

  const res = await fetch(relativeUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const rawText = await res.text();
  const clientDurationMs = Math.round(performance.now() - start);
  const sizeBytes = new Blob([rawText]).size;

  let body: unknown;
  try {
    body = JSON.parse(rawText);
  } catch {
    body = { rawResponse: rawText };
  }

  return {
    status: res.status,
    ok: res.ok,
    clientDurationMs,
    sizeBytes,
    url: fullUrl,
    body,
  };
}

export function loadRequestHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveRequestHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem[] {
  const current = loadRequestHistory();
  const next: HistoryItem[] = [
    {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    },
    ...current,
  ].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

export function clearRequestHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function formatUptime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

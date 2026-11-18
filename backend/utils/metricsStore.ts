export interface RequestLogEntry {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  querySummary: string;
  status: number;
  success: boolean;
  responseTimeMs: number;
  errorMessage?: string;
}

export interface UpstreamHealthState {
  status: 'ONLINE' | 'OFFLINE';
  latencyMs: number | null;
  lastCheckedAt: string | null;
  statusCode: number | null;
  reason?: string;
}

class MetricsStore {
  private readonly startedAt = Date.now();
  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private totalLatencyMs = 0;
  private readonly logs: RequestLogEntry[] = [];
  private readonly maxLogs = 100;

  public upstreamHealth: UpstreamHealthState = {
    status: 'OFFLINE',
    latencyMs: null,
    lastCheckedAt: null,
    statusCode: null,
    reason: 'Not checked yet',
  };

  recordRequest(entry: Omit<RequestLogEntry, 'id' | 'timestamp'>): void {
    this.totalRequests += 1;
    this.totalLatencyMs += entry.responseTimeMs;
    if (entry.success) {
      this.successfulRequests += 1;
    } else {
      this.failedRequests += 1;
    }

    const logItem: RequestLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(logItem);
    if (this.logs.length > this.maxLogs) {
      this.logs.length = this.maxLogs;
    }
  }

  getMetrics() {
    const uptimeSeconds = Math.floor((Date.now() - this.startedAt) / 1000);
    const avgLatencyMs =
      this.totalRequests > 0 ? Math.round(this.totalLatencyMs / this.totalRequests) : 0;
    const successRate =
      this.totalRequests > 0
        ? Math.round((this.successfulRequests / this.totalRequests) * 1000) / 10
        : 100;

    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      avgLatencyMs,
      successRate,
      uptimeSeconds,
      startedAt: new Date(this.startedAt).toISOString(),
    };
  }

  getLogs(filter?: 'all' | 'errors'): RequestLogEntry[] {
    if (filter === 'errors') {
      return this.logs.filter((log) => !log.success);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs.length = 0;
  }
}

export const metricsStore = new MetricsStore();

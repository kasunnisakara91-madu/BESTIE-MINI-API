export interface EndpointParam {
  name: string;
  type: 'string' | 'url';
  required: boolean;
  description: string;
  example: string;
}

export interface ApiEndpointDefinition {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  method: 'GET';
  path: string;
  upstreamPath: string;
  description: string;
  params: EndpointParam[];
  optionalParams?: EndpointParam[];
  exampleResponse: Record<string, unknown>;
}

export interface ApiCategorySummary {
  id: string;
  name: string;
  description: string;
  endpointCount: number;
}

export interface UpstreamHealthState {
  status: 'ONLINE' | 'OFFLINE';
  latencyMs: number | null;
  lastCheckedAt: string | null;
  statusCode: number | null;
  reason?: string;
}

export interface SystemMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatencyMs: number;
  successRate: number;
  uptimeSeconds: number;
  startedAt: string;
}

export interface SystemStatusResponse {
  success: boolean;
  service: string;
  status: 'ONLINE' | 'OFFLINE';
  upstream: UpstreamHealthState;
  apiKeyConfigured: boolean;
  totalEndpoints: number;
  totalCategories: number;
  metrics: SystemMetrics;
  runtime: {
    nodeVersion: string;
    platform: string;
    memoryRssMb: number;
    heapUsedMb: number;
  };
  categories: ApiCategorySummary[];
  timestamp: string;
}

export interface EndpointsResponse {
  success: boolean;
  totalEndpoints: number;
  categories: ApiCategorySummary[];
  endpoints: ApiEndpointDefinition[];
  timestamp: string;
}

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

export interface LogsResponse {
  success: boolean;
  filter: 'all' | 'errors';
  total: number;
  logs: RequestLogEntry[];
  timestamp: string;
}

export interface ProxyExecutionResult {
  status: number;
  ok: boolean;
  clientDurationMs: number;
  sizeBytes: number;
  url: string;
  body: unknown;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  categoryId: string;
  endpointId: string;
  path: string;
  params: Record<string, string>;
  status: number;
  ok: boolean;
  durationMs: number;
}

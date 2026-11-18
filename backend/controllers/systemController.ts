import os from 'node:os';
import type { Request, Response } from 'express';
import { API_CATEGORIES, API_ENDPOINTS } from '../config/endpoints.ts';
import { isApiKeyConfigured } from '../config/env.ts';
import { checkUpstreamHealth } from '../services/healthService.ts';
import { metricsStore } from '../utils/metricsStore.ts';

export async function getHealth(req: Request, res: Response): Promise<void> {
  const forceRefresh = req.query.refresh === 'true';
  const upstream = await checkUpstreamHealth(forceRefresh);
  const metrics = metricsStore.getMetrics();
  const isHealthy = upstream.status === 'ONLINE';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    service: 'BESTIE MINI API',
    status: upstream.status,
    upstream,
    apiKeyConfigured: isApiKeyConfigured(),
    uptimeSeconds: metrics.uptimeSeconds,
    timestamp: new Date().toISOString(),
  });
}

export async function getSystemStatus(req: Request, res: Response): Promise<void> {
  const forceRefresh = req.query.refresh === 'true';
  const upstream = await checkUpstreamHealth(forceRefresh);
  const metrics = metricsStore.getMetrics();
  const mem = process.memoryUsage();

  res.json({
    success: true,
    service: 'BESTIE MINI API',
    status: upstream.status,
    upstream,
    apiKeyConfigured: isApiKeyConfigured(),
    totalEndpoints: API_ENDPOINTS.length,
    totalCategories: API_CATEGORIES.length,
    metrics,
    runtime: {
      nodeVersion: process.version,
      platform: os.platform(),
      memoryRssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    },
    categories: API_CATEGORIES,
    timestamp: new Date().toISOString(),
  });
}

export function getSystemEndpoints(_req: Request, res: Response): void {
  res.json({
    success: true,
    totalEndpoints: API_ENDPOINTS.length,
    categories: API_CATEGORIES,
    endpoints: API_ENDPOINTS,
    timestamp: new Date().toISOString(),
  });
}

export function getSystemLogs(req: Request, res: Response): void {
  const filter = req.query.filter === 'errors' ? 'errors' : 'all';
  const logs = metricsStore.getLogs(filter);
  res.json({
    success: true,
    filter,
    total: logs.length,
    logs,
    timestamp: new Date().toISOString(),
  });
}

export function clearSystemLogs(_req: Request, res: Response): void {
  metricsStore.clearLogs();
  res.json({
    success: true,
    message: 'Request logs cleared',
    timestamp: new Date().toISOString(),
  });
}

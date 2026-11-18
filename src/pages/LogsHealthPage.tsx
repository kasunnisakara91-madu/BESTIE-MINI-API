import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  clearBackendLogs,
  fetchSystemLogs,
  formatUptime,
} from '../services/apiClient';
import type { RequestLogEntry, SystemStatusResponse } from '../types/api';

interface LogsHealthPageProps {
  statusData: SystemStatusResponse | null;
  statusLoading: boolean;
  onRefreshStatus: () => void;
}

export function LogsHealthPage({
  statusData,
  statusLoading,
  onRefreshStatus,
}: LogsHealthPageProps) {
  const [filter, setFilter] = useState<'all' | 'errors'>('all');
  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const res = await fetchSystemLogs(filter);
      setLogs(res.logs);
    } catch (err) {
      setLogsError(err instanceof Error ? err.message : 'Unable to fetch logs');
    } finally {
      setLogsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const handleClear = async () => {
    try {
      await clearBackendLogs();
      setLogs([]);
    } catch (err) {
      setLogsError(err instanceof Error ? err.message : 'Unable to clear logs');
    }
  };

  const isOnline = statusData?.status === 'ONLINE';

  return (
    <div className="space-y-8 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            API Health &amp; Error Logs
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Inspect live upstream reachability, Node.js gateway runtime stats, and recent proxy
            request &amp; error logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onRefreshStatus();
            void loadLogs();
          }}
          disabled={statusLoading || logsLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${statusLoading || logsLoading ? 'animate-spin' : ''}`}
          />
          <span>Run Live Health Check</span>
        </button>
      </div>

      {/* Health & Runtime Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-surface rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Upstream Provider Status</span>
            <Activity className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-center gap-2.5">
            {isOnline ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <span
              className={`font-display text-2xl font-bold ${
                isOnline ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {statusData?.status ?? 'CHECKING'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {statusData?.upstream.reason ?? 'Probing upstream provider...'}
          </p>
        </div>

        <div className="glass-surface rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Probe Latency &amp; Auth</span>
            <AlertTriangle className="w-4 h-4 text-violet-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {statusData?.upstream.latencyMs !== null &&
            statusData?.upstream.latencyMs !== undefined
              ? `${statusData.upstream.latencyMs} ms`
              : '—'}
          </div>
          <div className="text-xs text-zinc-400 space-y-1">
            <div>
              API Key:{' '}
              <span
                className={
                  statusData?.apiKeyConfigured ? 'text-emerald-300 font-medium' : 'text-amber-300 font-medium'
                }
              >
                {statusData?.apiKeyConfigured ? 'Configured on server' : 'Not configured'}
              </span>
            </div>
            <div>
              Upstream HTTP:{' '}
              <span className="font-mono text-zinc-300">
                {statusData?.upstream.statusCode ?? '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-surface rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Gateway Runtime</span>
            <Cpu className="w-4 h-4 text-violet-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {statusData ? formatUptime(statusData.metrics.uptimeSeconds) : '—'}
          </div>
          <div className="text-xs text-zinc-400 space-y-1 font-mono">
            <div>
              Node {statusData?.runtime.nodeVersion ?? '—'} · {statusData?.runtime.platform ?? '—'}
            </div>
            <div className="tabular-nums">
              Memory RSS: {statusData?.runtime.memoryRssMb ?? 0} MB (Heap{' '}
              {statusData?.runtime.heapUsedMb ?? 0} MB)
            </div>
          </div>
        </div>
      </div>

      {/* Request & Error Log Table */}
      <div className="glass-surface rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-white">
              Proxy Request &amp; Error Logs
            </h2>
            <span className="font-mono text-xs text-zinc-400 tabular-nums">({logs.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#0d0b17] border border-violet-500/20">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                All Requests
              </button>
              <button
                type="button"
                onClick={() => setFilter('errors')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === 'errors'
                    ? 'bg-rose-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                Errors Only
              </button>
            </div>

            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-violet-500/20 text-zinc-300 hover:text-rose-300 hover:border-rose-500/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Logs</span>
              </button>
            )}
          </div>
        </div>

        {logsError && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-200">
            {logsError}
          </div>
        )}

        {logsLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400 font-mono">
            Loading backend request logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-violet-500/20 rounded-xl">
            <p className="text-sm font-medium text-zinc-300">
              {filter === 'errors' ? 'No errors recorded' : 'No proxy requests logged yet'}
            </p>
            <p className="text-xs text-zinc-500">
              Requests executed through the API Testing Console or external clients will appear
              here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-violet-500/15">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-violet-500/15 bg-white/[0.02] text-zinc-400">
                  <th className="py-2.5 px-4 font-medium">Timestamp</th>
                  <th className="py-2.5 px-4 font-medium">Endpoint</th>
                  <th className="py-2.5 px-4 font-medium">Query</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium text-right">Latency</th>
                  <th className="py-2.5 px-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-zinc-100 whitespace-nowrap">
                      {log.method} {log.endpoint}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 max-w-[220px] truncate">
                      {log.querySummary}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap tabular-nums">
                      <span
                        className={
                          log.success ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'
                        }
                      >
                        {log.status} {log.success ? 'OK' : 'ERR'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-300 whitespace-nowrap tabular-nums">
                      {log.responseTimeMs} ms
                    </td>
                    <td className="py-3 px-4 font-sans text-zinc-300 max-w-[260px] truncate">
                      {log.errorMessage || 'Forwarded cleanly'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

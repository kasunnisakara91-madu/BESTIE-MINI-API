import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Film,
  Music,
  RefreshCw,
  Server,
  ShieldAlert,
  Terminal,
  Tv,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { AppRoute } from '../components/Navbar';
import { formatUptime } from '../services/apiClient';
import type { ApiCategorySummary, ApiEndpointDefinition, SystemStatusResponse } from '../types/api';

interface HomePageProps {
  statusData: SystemStatusResponse | null;
  statusLoading: boolean;
  statusError: string | null;
  endpoints: ApiEndpointDefinition[];
  onRefreshStatus: () => void;
  onNavigate: (path: AppRoute) => void;
  onSelectCategoryDocs: (categoryId: string) => void;
  onSelectCategoryTester: (categoryId: string) => void;
}

const CATEGORY_ICONS: Record<string, typeof Film> = {
  sinhalasub: Tv,
  cinesubz: Film,
  chithrapata: Film,
  pastpapers: FileText,
  tinkiri: Server,
  youtube: Music,
};

export function HomePage({
  statusData,
  statusLoading,
  statusError,
  endpoints,
  onRefreshStatus,
  onNavigate,
  onSelectCategoryDocs,
  onSelectCategoryTester,
}: HomePageProps) {
  const isOnline = statusData?.status === 'ONLINE';
  const totalEndpoints = statusData?.totalEndpoints ?? endpoints.length;
  const metrics = statusData?.metrics;
  const categories: ApiCategorySummary[] = statusData?.categories ?? [];

  return (
    <div className="space-y-12">
      {/* Hero & Live Status */}
      <section className="pt-4 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="glass-surface rounded-2xl p-6 sm:p-10 relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                <span className="font-mono text-violet-300 font-semibold">BESTIE MINI API</span>
                <span aria-hidden="true">·</span>
                <span>Server-Authenticated Proxy Gateway</span>
                <span aria-hidden="true">·</span>
                <span>{totalEndpoints} Live Endpoints</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12] [text-wrap:balance]">
                Unified Media, Subtitle &amp; Utility API Gateway
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                Production Node.js and Express.js proxy server forwarding authenticated requests to
                Sinhalasub, Cinesubz, Chithrapata, Past Papers, Tinkiri, and YouTube MP3 extraction
                endpoints with validation, rate limiting, and real-time telemetry.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/docs')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-violet-300"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>API Documentation</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/tester')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-violet-500/30 bg-white/[0.03] hover:bg-violet-500/15 text-zinc-100 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-violet-400"
                >
                  <Terminal className="w-4 h-4 text-violet-400" />
                  <span>Open API Tester</span>
                </button>
              </div>
            </div>

            {/* Live Health Status Panel */}
            <div className="lg:col-span-4 rounded-xl border border-violet-500/20 bg-[#0b0a14]/90 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-400">Live API Status</span>
                <button
                  type="button"
                  onClick={onRefreshStatus}
                  disabled={statusLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300 hover:text-violet-200 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {statusError ? (
                <div className="flex items-start gap-3 text-rose-300 text-sm">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Gateway Unreachable</div>
                    <div className="text-xs text-rose-300/80 mt-0.5">{statusError}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {isOnline ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div
                          className={`font-display text-xl font-bold tracking-tight ${
                            isOnline ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {statusData ? statusData.status : 'CHECKING...'}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {statusData?.upstream.latencyMs !== null &&
                          statusData?.upstream.latencyMs !== undefined
                            ? `Upstream latency: ${statusData.upstream.latencyMs} ms`
                            : 'Probing upstream host'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 space-y-1.5 text-xs text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span>API Key Config</span>
                      <span
                        className={`font-mono font-medium ${
                          statusData?.apiKeyConfigured ? 'text-emerald-300' : 'text-amber-300'
                        }`}
                      >
                        {statusData?.apiKeyConfigured ? 'Configured' : 'Missing Key'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gateway Uptime</span>
                      <span className="font-mono text-zinc-200 tabular-nums">
                        {metrics ? formatUptime(metrics.uptimeSeconds) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Checked</span>
                      <span className="font-mono text-zinc-300 tabular-nums">
                        {statusData?.upstream.lastCheckedAt
                          ? new Date(statusData.upstream.lastCheckedAt).toLocaleTimeString()
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Real Backend Metrics Strip */}
      <section aria-labelledby="telemetry-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="telemetry-heading" className="font-display text-xl font-semibold text-white">
            Live Backend Metrics
          </h2>
          <span className="text-xs text-zinc-400">
            Real-time gateway telemetry since server startup
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-surface rounded-xl p-5 space-y-2">
            <div className="text-xs font-medium text-zinc-400">Total Available Endpoints</div>
            <div className="font-mono text-3xl font-bold text-white tabular-nums">
              {totalEndpoints}
            </div>
            <div className="text-xs text-zinc-400">
              Across {statusData?.totalCategories ?? 6} integrated API providers
            </div>
          </div>

          <div className="glass-surface rounded-xl p-5 space-y-2">
            <div className="text-xs font-medium text-zinc-400">Total Requests</div>
            <div className="font-mono text-3xl font-bold text-white tabular-nums">
              {metrics ? metrics.totalRequests.toLocaleString() : '0'}
            </div>
            <div className="text-xs text-zinc-400 tabular-nums">
              Avg latency: {metrics ? `${metrics.avgLatencyMs} ms` : '0 ms'}
            </div>
          </div>

          <div className="glass-surface rounded-xl p-5 space-y-2">
            <div className="text-xs font-medium text-zinc-400">Successful Requests</div>
            <div className="font-mono text-3xl font-bold text-emerald-400 tabular-nums">
              {metrics ? metrics.successfulRequests.toLocaleString() : '0'}
            </div>
            <div className="text-xs text-zinc-400 tabular-nums">
              Success rate: {metrics ? `${metrics.successRate}%` : '100%'}
            </div>
          </div>

          <div className="glass-surface rounded-xl p-5 space-y-2">
            <div className="text-xs font-medium text-zinc-400">Failed Requests</div>
            <div className="font-mono text-3xl font-bold text-rose-400 tabular-nums">
              {metrics ? metrics.failedRequests.toLocaleString() : '0'}
            </div>
            <div className="text-xs text-zinc-400">
              <button
                type="button"
                onClick={() => onNavigate('/logs')}
                className="text-violet-300 hover:text-violet-200 underline-offset-2 hover:underline"
              >
                Inspect error logs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* API Categories Grid */}
      <section aria-labelledby="categories-heading" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 id="categories-heading" className="font-display text-xl font-semibold text-white">
              API Categories
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Select a category to browse endpoint documentation or test live responses.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/docs')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors self-start sm:self-auto"
          >
            <span>View all {totalEndpoints} endpoints</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] ?? Activity;
            return (
              <div
                key={cat.id}
                className="glass-surface rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-violet-400/35 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-300 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xs text-zinc-400 tabular-nums">
                      {cat.endpointCount} {cat.endpointCount === 1 ? 'endpoint' : 'endpoints'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">{cat.name}</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectCategoryDocs(cat.id)}
                    className="text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                  >
                    Read Docs
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectCategoryTester(cat.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200 transition-colors"
                  >
                    <span>Test Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

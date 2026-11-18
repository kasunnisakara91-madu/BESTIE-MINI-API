import {
  Check,
  Clock,
  Copy,
  Eraser,
  History,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { JsonSyntaxHighlight } from '../components/JsonSyntaxHighlight';
import {
  buildGatewayUrl,
  clearRequestHistory,
  executeProxyRequest,
  loadRequestHistory,
  saveRequestHistoryItem,
} from '../services/apiClient';
import type {
  ApiCategorySummary,
  ApiEndpointDefinition,
  HistoryItem,
  ProxyExecutionResult,
} from '../types/api';

interface TesterPageProps {
  endpoints: ApiEndpointDefinition[];
  categories: ApiCategorySummary[];
  preselectedEndpoint: ApiEndpointDefinition | null;
  preselectedCategory: string | null;
  onRequestCompleted: () => void;
}

export function TesterPage({
  endpoints,
  categories,
  preselectedEndpoint,
  preselectedCategory,
  onRequestCompleted,
}: TesterPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    preselectedEndpoint?.categoryId || preselectedCategory || categories[0]?.id || 'sinhalasub',
  );
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(
    preselectedEndpoint?.id || endpoints[0]?.id || '',
  );
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProxyExecutionResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadRequestHistory());

  const categoryEndpoints = useMemo(() => {
    if (selectedCategory === 'all') return endpoints;
    return endpoints.filter((e) => e.categoryId === selectedCategory);
  }, [endpoints, selectedCategory]);

  const activeEndpoint = useMemo(() => {
    return (
      endpoints.find((e) => e.id === selectedEndpointId) ||
      categoryEndpoints[0] ||
      endpoints[0]
    );
  }, [endpoints, selectedEndpointId, categoryEndpoints]);

  // Sync when preselected from Home or Docs
  useEffect(() => {
    if (preselectedEndpoint) {
      setSelectedCategory(preselectedEndpoint.categoryId);
      setSelectedEndpointId(preselectedEndpoint.id);
      const nextParams: Record<string, string> = {};
      for (const p of preselectedEndpoint.params) {
        nextParams[p.name] = p.example;
      }
      setParamValues(nextParams);
      setResult(null);
    }
  }, [preselectedEndpoint]);

  useEffect(() => {
    if (preselectedCategory && !preselectedEndpoint) {
      setSelectedCategory(preselectedCategory);
      const first = endpoints.find((e) => e.categoryId === preselectedCategory);
      if (first) {
        setSelectedEndpointId(first.id);
        const nextParams: Record<string, string> = {};
        for (const p of first.params) {
          nextParams[p.name] = p.example;
        }
        setParamValues(nextParams);
      }
    }
  }, [preselectedCategory, preselectedEndpoint, endpoints]);

  // Populate default examples when switching endpoint manually
  const handleEndpointChange = (newId: string) => {
    setSelectedEndpointId(newId);
    const ep = endpoints.find((e) => e.id === newId);
    if (ep) {
      const nextParams: Record<string, string> = {};
      for (const p of ep.params) {
        nextParams[p.name] = p.example;
      }
      setParamValues(nextParams);
      setResult(null);
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setSelectedCategory(newCat);
    const first =
      newCat === 'all'
        ? endpoints[0]
        : endpoints.find((e) => e.categoryId === newCat);
    if (first) {
      handleEndpointChange(first.id);
    }
  };

  const handleFillSample = () => {
    if (!activeEndpoint) return;
    const nextParams: Record<string, string> = {};
    for (const p of activeEndpoint.params) {
      nextParams[p.name] = p.example;
    }
    setParamValues(nextParams);
  };

  const generatedUrl = activeEndpoint
    ? buildGatewayUrl(activeEndpoint.path, paramValues)
    : '';

  const handleCopyUrl = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1800);
    } catch {
      // Ignore
    }
  };

  const handleSendRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeEndpoint || loading) return;

    setLoading(true);
    try {
      const execResult = await executeProxyRequest(activeEndpoint.path, paramValues);
      setResult(execResult);

      const nextHistory = saveRequestHistoryItem({
        categoryId: activeEndpoint.categoryId,
        endpointId: activeEndpoint.id,
        path: activeEndpoint.path,
        params: { ...paramValues },
        status: execResult.status,
        ok: execResult.ok,
        durationMs: execResult.clientDurationMs,
      });
      setHistory(nextHistory);
      onRequestCompleted();
    } catch (err) {
      setResult({
        status: 0,
        ok: false,
        clientDurationMs: 0,
        sizeBytes: 0,
        url: generatedUrl,
        body: {
          success: false,
          error: {
            message: err instanceof Error ? err.message : 'Request failed',
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReplayHistory = (item: HistoryItem) => {
    setSelectedCategory(item.categoryId);
    setSelectedEndpointId(item.endpointId);
    setParamValues({ ...item.params });
  };

  const handleClearHistory = () => {
    clearRequestHistory();
    setHistory([]);
  };

  return (
    <div className="space-y-8 pt-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          API Testing Console
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Send live GET requests through the BESTIE MINI API gateway and inspect authentic upstream
          JSON responses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Request Builder & Response Inspector */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSendRequest} className="glass-surface rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="tester-category"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  1. API Category
                </label>
                <select
                  id="tester-category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0b17] border border-violet-500/25 text-sm text-zinc-100 focus:outline-none focus:border-violet-400"
                >
                  <option value="all">All Categories ({endpoints.length})</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.endpointCount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="tester-endpoint"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  2. Endpoint
                </label>
                <select
                  id="tester-endpoint"
                  value={activeEndpoint?.id ?? ''}
                  onChange={(e) => handleEndpointChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0b17] border border-violet-500/25 text-sm font-mono text-zinc-100 focus:outline-none focus:border-violet-400"
                >
                  {categoryEndpoints.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      GET {ep.path} — {ep.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeEndpoint && (
              <div className="text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-2 pt-1">
                <span>{activeEndpoint.description}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleFillSample}
                    className="inline-flex items-center gap-1 text-violet-300 hover:text-violet-200 font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fill Sample</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParamValues({})}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 font-medium"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Query Parameters */}
            {activeEndpoint && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="text-xs font-semibold text-zinc-300">3. Query Parameters</div>
                <div className="space-y-3">
                  {activeEndpoint.params.map((param) => (
                    <div key={param.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label
                          htmlFor={`param-${param.name}`}
                          className="font-mono font-semibold text-violet-300"
                        >
                          {param.name}
                          {param.required && (
                            <span className="text-amber-300 font-sans ml-1.5">*required</span>
                          )}
                        </label>
                        <span className="text-zinc-500">{param.description}</span>
                      </div>
                      <input
                        id={`param-${param.name}`}
                        type="text"
                        value={paramValues[param.name] ?? ''}
                        onChange={(e) =>
                          setParamValues((prev) => ({
                            ...prev,
                            [param.name]: e.target.value,
                          }))
                        }
                        placeholder={param.example}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0b17] border border-violet-500/25 font-mono text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated URL & Send Action */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="text-xs font-semibold text-zinc-300">Generated Gateway URL</div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#09080f] border border-violet-500/20 font-mono text-xs text-zinc-300 overflow-x-auto whitespace-nowrap">
                  <span className="text-emerald-400 font-semibold mr-2">GET</span>
                  <span>{generatedUrl}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-medium border border-violet-500/25 text-zinc-200 hover:bg-violet-500/15 transition-colors whitespace-nowrap shrink-0"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied URL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-violet-400" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading || !activeEndpoint}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-violet-300"
                >
                  <Play className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                  <span>{loading ? 'Sending GET Request...' : 'Send GET Request'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Response Viewer */}
          <div className="glass-surface rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-white">Response Inspector</h2>

              {result && (
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
                  <span
                    className={`font-semibold ${
                      result.ok ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Status: {result.status || 'Network Error'}
                  </span>
                  <span className="text-zinc-300">Time: {result.clientDurationMs} ms</span>
                  <span className="text-zinc-400">
                    Size: {(result.sizeBytes / 1024).toFixed(2)} KB
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="rounded-xl border border-violet-500/15 bg-[#0b0a14] p-10 text-center space-y-3">
                <div className="w-7 h-7 mx-auto rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                <p className="text-xs text-zinc-400 font-mono">
                  Proxying authenticated request to upstream provider...
                </p>
              </div>
            ) : result ? (
              <JsonSyntaxHighlight data={result.body} maxHeightClass="max-h-[540px]" />
            ) : (
              <div className="rounded-xl border border-dashed border-violet-500/20 bg-[#0b0a14]/60 p-10 text-center space-y-2">
                <p className="text-sm font-medium text-zinc-300">No response yet</p>
                <p className="text-xs text-zinc-500">
                  Configure parameters above and click &ldquo;Send GET Request&rdquo; to inspect
                  real upstream data.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Request History Panel */}
        <aside className="lg:col-span-4 glass-surface rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-violet-400" />
              <h2 className="font-display text-base font-semibold text-white">Request History</h2>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              Your tested requests will appear here for one-click replay.
            </div>
          ) : (
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleReplayHistory(item)}
                  className="w-full text-left p-3 rounded-xl border border-white/5 bg-[#0d0b17] hover:border-violet-500/35 transition-colors space-y-1.5 group"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-zinc-200 font-semibold truncate">{item.path}</span>
                    <span
                      className={`shrink-0 font-semibold tabular-nums ${
                        item.ok ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.status || 'ERR'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono truncate">
                    {Object.entries(item.params)
                      .map(([k, v]) => `${k}=${v}`)
                      .join('&') || '(no params)'}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.durationMs} ms
                    </span>
                    <span className="inline-flex items-center gap-1 text-violet-400 opacity-80 group-hover:opacity-100">
                      <RotateCcw className="w-3 h-3" />
                      Load
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

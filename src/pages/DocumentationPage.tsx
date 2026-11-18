import { Check, Copy, Play, Search, Terminal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CodeSnippetViewer } from '../components/CodeSnippetViewer';
import { JsonSyntaxHighlight } from '../components/JsonSyntaxHighlight';
import { buildGatewayUrl, executeProxyRequest } from '../services/apiClient';
import type {
  ApiCategorySummary,
  ApiEndpointDefinition,
  ProxyExecutionResult,
} from '../types/api';

interface DocumentationPageProps {
  endpoints: ApiEndpointDefinition[];
  categories: ApiCategorySummary[];
  initialCategory: string;
  onOpenInTester: (endpoint: ApiEndpointDefinition) => void;
  onRequestCompleted: () => void;
}

export function DocumentationPage({
  endpoints,
  categories,
  initialCategory,
  onOpenInTester,
  onRequestCompleted,
}: DocumentationPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [liveTestingId, setLiveTestingId] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<Record<string, ProxyExecutionResult>>({});

  const filteredEndpoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return endpoints.filter((ep) => {
      const matchesCategory = selectedCategory === 'all' || ep.categoryId === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        ep.name.toLowerCase().includes(q) ||
        ep.path.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q) ||
        ep.categoryName.toLowerCase().includes(q) ||
        ep.params.some((p) => p.name.toLowerCase().includes(q))
      );
    });
  }, [endpoints, selectedCategory, searchQuery]);

  const handleCopyUrl = async (ep: ApiEndpointDefinition) => {
    const sampleParams: Record<string, string> = {};
    for (const p of ep.params) {
      sampleParams[p.name] = p.example;
    }
    const url = buildGatewayUrl(ep.path, sampleParams);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(ep.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleQuickLiveTest = async (ep: ApiEndpointDefinition) => {
    setLiveTestingId(ep.id);
    const sampleParams: Record<string, string> = {};
    for (const p of ep.params) {
      sampleParams[p.name] = p.example;
    }
    try {
      const result = await executeProxyRequest(ep.path, sampleParams);
      setLiveResults((prev) => ({ ...prev, [ep.id]: result }));
      onRequestCompleted();
    } catch (err) {
      setLiveResults((prev) => ({
        ...prev,
        [ep.id]: {
          status: 0,
          ok: false,
          clientDurationMs: 0,
          sizeBytes: 0,
          url: buildGatewayUrl(ep.path, sampleParams),
          body: {
            success: false,
            error: { message: err instanceof Error ? err.message : 'Network error' },
          },
        },
      }));
    } finally {
      setLiveTestingId(null);
    }
  };

  return (
    <div className="space-y-8 pt-4">
      {/* Header & Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              API Documentation
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Complete reference for all {endpoints.length} server-authenticated endpoints. No API
              key required in client requests.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search endpoints or params..."
              aria-label="Search API endpoints"
              className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-[#110f1b] border border-violet-500/25 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#0e0c18] border border-violet-500/15">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
            }`}
          >
            All ({endpoints.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
              }`}
            >
              {cat.name.replace(' API', '')} ({cat.endpointCount})
            </button>
          ))}
        </div>
      </div>

      {/* Empty Search State */}
      {filteredEndpoints.length === 0 ? (
        <div className="glass-surface rounded-xl p-10 text-center space-y-3">
          <p className="text-base font-medium text-zinc-200">
            No endpoints matched &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-zinc-400">
            Try clearing your search filter or switching categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEndpoints.map((ep) => {
            const liveResult = liveResults[ep.id];
            const isTesting = liveTestingId === ep.id;

            return (
              <article
                key={ep.id}
                id={ep.id}
                className="glass-surface rounded-2xl p-6 space-y-6"
              >
                {/* Endpoint Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="text-violet-300 font-medium">{ep.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-semibold text-emerald-300">{ep.method}</span>
                      <span aria-hidden="true">·</span>
                      <code className="font-mono text-zinc-100 text-sm">{ep.path}</code>
                    </div>
                    <h2 className="font-display text-xl font-semibold text-white">{ep.name}</h2>
                    <p className="text-sm text-zinc-400">{ep.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(ep)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-violet-500/25 text-zinc-200 hover:bg-violet-500/15 transition-colors whitespace-nowrap shrink-0"
                    >
                      {copiedId === ep.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>URL Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-violet-400" />
                          <span>Copy Endpoint</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLiveTest(ep)}
                      disabled={isTesting}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600/20 border border-emerald-500/35 text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isTesting ? 'Running...' : 'Live Test'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenInTester(ep)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors whitespace-nowrap shrink-0"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Open in Tester</span>
                    </button>
                  </div>
                </div>

                {/* Query Parameters Table */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-semibold text-zinc-300 tracking-wide">
                    Query Parameters
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-violet-500/15">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-violet-500/15 bg-white/[0.02] text-zinc-400">
                          <th className="py-2.5 px-4 font-medium">Parameter</th>
                          <th className="py-2.5 px-4 font-medium">Type</th>
                          <th className="py-2.5 px-4 font-medium">Requirement</th>
                          <th className="py-2.5 px-4 font-medium">Description</th>
                          <th className="py-2.5 px-4 font-medium">Example</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ep.params.map((param) => (
                          <tr key={param.name} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-4 font-mono font-semibold text-violet-300">
                              {param.name}
                            </td>
                            <td className="py-3 px-4 font-mono text-zinc-300">{param.type}</td>
                            <td className="py-3 px-4">
                              <span
                                className={
                                  param.required
                                    ? 'text-amber-300 font-medium'
                                    : 'text-zinc-400'
                                }
                              >
                                {param.required ? 'Required' : 'Optional'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-zinc-300">{param.description}</td>
                            <td className="py-3 px-4 font-mono text-zinc-400 max-w-[260px] truncate">
                              {param.example}
                            </td>
                          </tr>
                        ))}
                        {(ep.optionalParams ?? []).map((param) => (
                          <tr key={param.name} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-4 font-mono font-semibold text-violet-300">
                              {param.name}
                            </td>
                            <td className="py-3 px-4 font-mono text-zinc-300">{param.type}</td>
                            <td className="py-3 px-4 text-zinc-400">Optional</td>
                            <td className="py-3 px-4 text-zinc-300">{param.description}</td>
                            <td className="py-3 px-4 font-mono text-zinc-400">{param.example}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Inline Live Test Response (when triggered) */}
                {liveResult && (
                  <div className="space-y-2.5 pt-2 border-t border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-white">Live Gateway Response</span>
                      <div className="flex items-center gap-3 font-mono tabular-nums">
                        <span
                          className={
                            liveResult.ok ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'
                          }
                        >
                          HTTP {liveResult.status || 'ERR'}
                        </span>
                        <span className="text-zinc-400">{liveResult.clientDurationMs} ms</span>
                      </div>
                    </div>
                    <JsonSyntaxHighlight data={liveResult.body} maxHeightClass="max-h-[300px]" />
                  </div>
                )}

                {/* Multi-language Code Examples */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-semibold text-zinc-300 tracking-wide">
                    Code Examples &amp; Response Schema
                  </h3>
                  <CodeSnippetViewer endpoint={ep} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { buildGatewayUrl } from '../services/apiClient';
import type { ApiEndpointDefinition } from '../types/api';
import { JsonSyntaxHighlight } from './JsonSyntaxHighlight';

type CodeLang = 'json' | 'javascript' | 'axios' | 'python' | 'curl';

interface CodeSnippetViewerProps {
  endpoint: ApiEndpointDefinition;
}

const TABS: Array<{ id: CodeLang; label: string }> = [
  { id: 'json', label: 'Response JSON' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'axios', label: 'Node.js Axios' },
  { id: 'python', label: 'Python' },
  { id: 'curl', label: 'cURL' },
];

export function CodeSnippetViewer({ endpoint }: CodeSnippetViewerProps) {
  const [activeLang, setActiveLang] = useState<CodeLang>('json');
  const [copied, setCopied] = useState(false);

  const sampleParams = useMemo(() => {
    const record: Record<string, string> = {};
    for (const p of endpoint.params) {
      record[p.name] = p.example;
    }
    return record;
  }, [endpoint]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.up.railway.app';
  const fullSampleUrl = buildGatewayUrl(endpoint.path, sampleParams, origin);

  const codeByLang = useMemo(() => {
    const paramPairs = endpoint.params
      .map((p) => `    "${p.name}": "${p.example}"`)
      .join(',\n');

    return {
      javascript: `const url = new URL("${origin}${endpoint.path}");
${endpoint.params
  .map((p) => `url.searchParams.set("${p.name}", "${p.example}");`)
  .join('\n')}

const response = await fetch(url.toString(), {
  method: "GET",
  headers: { Accept: "application/json" }
});

const payload = await response.json();
console.log(payload);`,

      axios: `import axios from "axios";

const { data } = await axios.get("${origin}${endpoint.path}", {
  params: {
${paramPairs}
  }
});

console.log(data);`,

      python: `import requests

url = "${origin}${endpoint.path}"
params = {
${paramPairs}
}

response = requests.get(url, params=params, timeout=15)
response.raise_for_status()
print(response.json())`,

      curl: `curl -X GET "${fullSampleUrl}" \\
  -H "Accept: application/json"`,
    };
  }, [endpoint, fullSampleUrl, origin]);

  const activeText =
    activeLang === 'json'
      ? JSON.stringify(endpoint.exampleResponse, null, 2)
      : codeByLang[activeLang];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#0d0b18] border border-violet-500/20"
          role="tablist"
          aria-label="Code language examples"
        >
          {TABS.map((tab) => {
            const active = activeLang === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveLang(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-violet-400 ${
                  active
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeLang !== 'json' && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-violet-500/25 text-zinc-200 hover:bg-violet-500/15 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-violet-400"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-violet-400" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        )}
      </div>

      {activeLang === 'json' ? (
        <JsonSyntaxHighlight data={endpoint.exampleResponse} maxHeightClass="max-h-[340px]" />
      ) : (
        <div className="rounded-xl border border-violet-500/20 bg-[#0b0a14] overflow-hidden">
          <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono text-zinc-200">
            <code>{activeText}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

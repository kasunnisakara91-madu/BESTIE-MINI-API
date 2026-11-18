import { Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';

interface JsonSyntaxHighlightProps {
  data: unknown;
  maxHeightClass?: string;
}

function renderTokenizedJson(jsonText: string) {
  const tokenRegex =
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

  const nodes: Array<{ key: number; text: string; className: string }> = [];
  let lastIndex = 0;
  let keyCounter = 0;

  for (const match of jsonText.matchAll(tokenRegex)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      nodes.push({
        key: keyCounter++,
        text: jsonText.slice(lastIndex, matchIndex),
        className: 'text-zinc-500',
      });
    }

    const token = match[0];
    let className = 'text-amber-300'; // number

    if (token.startsWith('"')) {
      if (token.endsWith(':')) {
        className = 'text-violet-300 font-medium';
      } else {
        className = 'text-emerald-300';
      }
    } else if (token === 'true' || token === 'false') {
      className = 'text-fuchsia-300 font-semibold';
    } else if (token === 'null') {
      className = 'text-zinc-400 italic';
    }

    nodes.push({
      key: keyCounter++,
      text: token,
      className,
    });

    lastIndex = matchIndex + token.length;
  }

  if (lastIndex < jsonText.length) {
    nodes.push({
      key: keyCounter++,
      text: jsonText.slice(lastIndex),
      className: 'text-zinc-500',
    });
  }

  return nodes;
}

export function JsonSyntaxHighlight({
  data,
  maxHeightClass = 'max-h-[460px]',
}: JsonSyntaxHighlightProps) {
  const [copied, setCopied] = useState(false);

  const formattedJson = useMemo(() => {
    try {
      return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  const tokens = useMemo(() => renderTokenizedJson(formattedJson), [formattedJson]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard permission unavailable
    }
  };

  return (
    <div className="relative rounded-xl border border-violet-500/20 bg-[#0b0a14] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-500/15 bg-white/[0.02]">
        <span className="font-mono text-xs text-zinc-400">application/json</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-violet-500/15 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-violet-400"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-violet-400" />
              <span>Copy JSON</span>
            </>
          )}
        </button>
      </div>
      <pre
        className={`p-4 overflow-auto text-xs leading-relaxed font-mono ${maxHeightClass}`}
      >
        <code>
          {tokens.map((tok) => (
            <span key={tok.key} className={tok.className}>
              {tok.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/utils/utils';

interface CodeBlockProps {
  code: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, className = '', showLineNumbers: forceLineNumbers }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');
  const showLineNumbers = forceLineNumbers ?? lines.length > 1;

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`relative group w-full ${className}`}>
      <div className="w-full bg-slate-900/90 border border-white/10 rounded-xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-slate-500 ml-2">Terminal</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all cursor-pointer-custom bg-slate-700/50 hover:bg-slate-600/50"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Copy</span>
              </>
            )}
          </button>
        </div>
        {/* Code content */}
        <div className="relative w-full overflow-x-auto scrollbar-thin p-4">
          <div className="flex">
            {showLineNumbers && (
              <div className="select-none pr-4 text-right border-r border-white/5 mr-4">
                {lines.map((_, i) => (
                  <div key={i} className="text-xs text-slate-600 font-mono leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            <code className="text-sm text-slate-300 font-mono whitespace-pre block flex-1">
              {lines.map((line, i) => (
                <div key={i} className="leading-6 hover:bg-white/5 -mx-2 px-2 rounded">
                  {line || ' '}
                </div>
              ))}
            </code>
          </div>
        </div>
      </div>
      {/* Copy toast notification */}
      {copied && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-emerald-500/90 text-white text-xs font-medium animate-fade-in shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}

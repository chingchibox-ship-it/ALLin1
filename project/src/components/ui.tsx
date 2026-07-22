import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          // ignore
        }
      }}
      className={`btn-secondary !py-1.5 !px-3 text-xs ${className}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : label}
    </button>
  );
}

export function Stat({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-line px-4 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-xl font-bold mt-0.5 ${accent ? 'text-brand-600' : 'text-ink'}`}>{value}</div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{children}</div>;
}

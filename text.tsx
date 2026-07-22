import { useState } from 'react';
import { makeTool } from './image';
import { ToolEmpty } from '../components/ToolShell';
import { Stat, CopyButton } from '../components/ui';

/* ---------- Word Counter ---------- */
export const TextWordCounter = makeTool('text-word-counter', () => {
  const [text, setText] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || 1 : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length : 0;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Your text</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="input" placeholder="Paste or type your text…" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Words" value={words} accent />
            <Stat label="Characters" value={text.length} />
            <Stat label="Sentences" value={sentences} />
            <Stat label="Paragraphs" value={paragraphs} />
            <Stat label="Lines" value={text ? text.split('\n').length : 0} />
            <Stat label="Reading time" value={`${Math.max(1, Math.ceil(words / 200))} min`} />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- Character Counter ---------- */
export const TextCharCounter = makeTool('text-char-counter', () => {
  const [text, setText] = useState('');
  const noSpaces = text.replace(/\s/g, '').length;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Your text</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="input" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Characters" value={text.length} accent />
            <Stat label="No spaces" value={noSpaces} />
            <Stat label="Words" value={text.trim() ? text.trim().split(/\s+/).length : 0} />
            <Stat label="Lines" value={text ? text.split('\n').length : 0} />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- Remove Extra Spaces ---------- */
export const TextRemoveSpaces = makeTool('text-remove-spaces', () => {
  const [text, setText] = useState('');
  const out = text.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="input" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Cleaned</h2>
          <pre className="text-sm whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[12rem]">{out}</pre>
          <div className="mt-3"><CopyButton text={out} /></div>
        </div>
      </div>
    </>
  );
});

/* ---------- Case Converter ---------- */
export const TextCase = makeTool('text-case', () => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('title');
  const conv = (m: string, t: string) => {
    switch (m) {
      case 'upper': return t.toUpperCase();
      case 'lower': return t.toLowerCase();
      case 'title': return t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      case 'sentence': return t.replace(/(^\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
      case 'camel': return t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
      case 'snake': return t.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      case 'kebab': return t.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      case 'alternating': return t.split('').map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('');
      default: return t;
    }
  };
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="input" />
          <div className="flex flex-wrap gap-2 mt-3">
            {['upper', 'lower', 'title', 'sentence', 'camel', 'snake', 'kebab', 'alternating'].map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`btn-secondary ${mode === m ? '!border-brand-400 !text-brand-600' : ''}`}>{m}</button>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          <pre className="text-sm whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[10rem]">{conv(mode, text)}</pre>
          <div className="mt-3"><CopyButton text={conv(mode, text)} /></div>
        </div>
      </div>
    </>
  );
});

/* ---------- Sort Lines ---------- */
export const TextSortLines = makeTool('text-sort-lines', () => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'az' | 'za' | 'num' | 'len'>('az');
  const lines = text.split('\n');
  const sort = () => {
    const arr = [...lines];
    if (mode === 'az') arr.sort((a, b) => a.localeCompare(b));
    if (mode === 'za') arr.sort((a, b) => b.localeCompare(a));
    if (mode === 'num') arr.sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
    if (mode === 'len') arr.sort((a, b) => a.length - b.length);
    return arr.join('\n');
  };
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="input font-mono" />
          <div className="flex flex-wrap gap-2 mt-3">
            {([['az', 'A→Z'], ['za', 'Z→A'], ['num', 'Numeric'], ['len', 'By length']] as const).map(([m, l]) => (
              <button key={m} onClick={() => setMode(m)} className={`btn-secondary ${mode === m ? '!border-brand-400 !text-brand-600' : ''}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Sorted</h2>
          <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[10rem]">{sort()}</pre>
          <div className="mt-3"><CopyButton text={sort()} /></div>
        </div>
      </div>
    </>
  );
});

/* ---------- Duplicate Line Remover ---------- */
export const TextDuplicateRemover = makeTool('text-duplicate-remover', () => {
  const [text, setText] = useState('');
  const [ci, setCi] = useState(false);
  const seen = new Set<string>();
  const out = text.split('\n').filter((l) => {
    const key = ci ? l.toLowerCase() : l;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join('\n');
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="input font-mono" />
          <label className="flex items-center gap-2 mt-3 text-sm text-slate-600">
            <input type="checkbox" checked={ci} onChange={(e) => setCi(e.target.checked)} /> Case-insensitive
          </label>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Unique lines</h2>
          <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[10rem]">{out}</pre>
          <div className="mt-3"><CopyButton text={out} /></div>
        </div>
      </div>
    </>
  );
});

/* ---------- Text Compare ---------- */
export const TextCompare = makeTool('text-compare', () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const la = a.split('\n');
  const lb = b.split('\n');
  const max = Math.max(la.length, lb.length);
  const rows: { a: string; b: string; same: boolean }[] = [];
  for (let i = 0; i < max; i++) {
    const xa = la[i] ?? '';
    const xb = lb[i] ?? '';
    rows.push({ a: xa, b: xb, same: xa === xb });
  }
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Text A</h2>
          <textarea value={a} onChange={(e) => setA(e.target.value)} rows={8} className="input font-mono" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Text B</h2>
          <textarea value={b} onChange={(e) => setB(e.target.value)} rows={8} className="input font-mono" />
        </div>
      </div>
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Diff</h2>
        {a || b ? (
          <div className="font-mono text-sm">
            {rows.map((r, i) => (
              <div key={i} className={`flex gap-2 py-0.5 px-2 rounded ${r.same ? '' : r.a ? 'bg-rose-50' : 'bg-accent-50'}`}>
                <span className="text-slate-400 w-8 text-right">{i + 1}</span>
                <span className="flex-1">{r.a || '—'}</span>
                <span className="text-slate-300">|</span>
                <span className="flex-1">{r.b || '—'}</span>
              </div>
            ))}
          </div>
        ) : <ToolEmpty />}
      </div>
    </>
  );
});

/* ---------- Find & Replace ---------- */
export const TextFindReplace = makeTool('text-find-replace', () => {
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [regex, setRegex] = useState(false);
  const [ci, setCi] = useState(false);
  let out = text;
  try {
    if (regex) {
      out = text.replace(new RegExp(find, ci ? 'gi' : 'g'), replace);
    } else {
      const esc = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = text.replace(new RegExp(esc, ci ? 'gi' : 'g'), replace);
    }
  } catch { out = text; }
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="input" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div><label className="label">Find</label><input value={find} onChange={(e) => setFind(e.target.value)} className="input" /></div>
            <div><label className="label">Replace</label><input value={replace} onChange={(e) => setReplace(e.target.value)} className="input" /></div>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-slate-600"><input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} /> Regex</label>
          <label className="flex items-center gap-2 mt-2 text-sm text-slate-600"><input type="checkbox" checked={ci} onChange={(e) => setCi(e.target.checked)} /> Case-insensitive</label>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          <pre className="text-sm whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[10rem]">{out}</pre>
          <div className="mt-3"><CopyButton text={out} /></div>
        </div>
      </div>
    </>
  );
});

/* ---------- Random Text Generator ---------- */
export const TextRandom = makeTool('text-random', () => {
  const [paras, setParas] = useState(3);
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];
  const gen = () => {
    const out: string[] = [];
    for (let p = 0; p < paras; p++) {
      const s: string[] = [];
      const n = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) {
        const len = 6 + Math.floor(Math.random() * 10);
        const w = Array.from({ length: len }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
        s.push(w.charAt(0).toUpperCase() + w.slice(1) + '.');
      }
      out.push(s.join(' '));
    }
    return out.join('\n\n');
  };
  const [text, setText] = useState(gen());
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Options</h2>
          <label className="label">Paragraphs: {paras}</label>
          <input type="range" min={1} max={20} value={paras} onChange={(e) => setParas(+e.target.value)} className="w-full mb-3" />
          <button onClick={() => setText(gen())} className="btn-primary w-full">Generate</button>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Output</h2>
          <pre className="text-sm whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[10rem]">{text}</pre>
          <div className="mt-3"><CopyButton text={text} /></div>
        </div>
      </div>
    </>
  );
});

// Dispatcher for lazy loading by name.
import type { ComponentType } from 'react';
const TEXT_COMPONENTS: Record<string, ComponentType<{ onSignIn: () => void }>> = {
  TextWordCounter, TextCharCounter, TextRemoveSpaces, TextCase, TextSortLines,
  TextDuplicateRemover, TextCompare, TextFindReplace, TextRandom,
};
export default function TextDispatcher({ name, onSignIn }: { name: string; onSignIn: () => void }) {
  const C = TEXT_COMPONENTS[name];
  return C ? <C onSignIn={onSignIn} /> : null;
}

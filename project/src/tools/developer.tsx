import { useState } from 'react';
import { makeTool } from './image';
import { ToolEmpty } from '../components/ToolShell';
import { CopyButton, Stat } from '../components/ui';

/* ---------- JSON Formatter ---------- */
export const DevJsonFormatter = makeTool('dev-json-formatter', () => {
  const [text, setText] = useState('');
  const [out, setOut] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  const run = () => {
    try {
      const obj = JSON.parse(text);
      setOut(JSON.stringify(obj, null, indent));
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
      setOut('');
    }
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="input font-mono" placeholder='{"key":"value"}' />
          <div className="flex items-center gap-3 mt-3">
            <label className="label !mb-0">Indent</label>
            <select value={indent} onChange={(e) => setIndent(+e.target.value)} className="input !w-auto">
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={0}>Minified</option>
            </select>
            <button onClick={run} className="btn-primary">Format</button>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Output</h2>
          {err ? <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{err}</div> : (
            <>
              <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[12rem] max-h-96 overflow-auto">{out}</pre>
              {out && <div className="mt-3"><CopyButton text={out} /></div>}
            </>
          )}
        </div>
      </div>
    </>
  );
});

/* ---------- JSON Validator ---------- */
export const DevJsonValidator = makeTool('dev-json-validator', () => {
  const [text, setText] = useState('');
  let valid: boolean | null = null;
  let err: string | null = null;
  if (text.trim()) {
    try { JSON.parse(text); valid = true; } catch (e) { valid = false; err = (e as Error).message; }
  }
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">JSON</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="input font-mono" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Status</h2>
          {valid === null ? <ToolEmpty label="Enter JSON to validate." /> : (
            <div>
              <div className={`chip ${valid ? 'bg-accent-50 text-accent-700' : 'bg-rose-50 text-rose-700'}`}>{valid ? 'Valid JSON' : 'Invalid JSON'}</div>
              {err && <pre className="text-xs text-rose-600 mt-3 font-mono whitespace-pre-wrap">{err}</pre>}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

/* ---------- HTML Formatter ---------- */
export const DevHtmlFormatter = makeTool('dev-html-formatter', () => {
  const [text, setText] = useState('');
  const format = (html: string) => {
    const tab = '  ';
    let out = '';
    let indent = 0;
    const tokens = html.replace(/></g, '>\n<').split('\n');
    tokens.forEach((line) => {
      const t = line.trim();
      if (!t) return;
      if (/^<\/\w/.test(t)) indent = Math.max(0, indent - 1);
      out += tab.repeat(indent) + t + '\n';
      if (/^<\w[^>]*[^/]>$/.test(t) && !/^<area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr/i.test(t)) indent++;
    });
    return out.trim();
  };
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="input font-mono" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Formatted</h2>
          <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[12rem]">{text ? format(text) : ''}</pre>
          {text && <div className="mt-3"><CopyButton text={format(text)} /></div>}
        </div>
      </div>
    </>
  );
});

/* ---------- CSS Minifier ---------- */
export const DevCssMinifier = makeTool('dev-css-minifier', () => {
  const [text, setText] = useState('');
  const out = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').replace(/;}/g, '}').trim();
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">CSS</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="input font-mono" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Minified ({out.length} chars)</h2>
          <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[12rem] break-all">{out}</pre>
          {out && <div className="mt-3"><CopyButton text={out} /></div>}
        </div>
      </div>
    </>
  );
});

/* ---------- JS Minifier ---------- */
export const DevJsMinifier = makeTool('dev-js-minifier', () => {
  const [text, setText] = useState('');
  const out = text
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([=+\-*/%<>!&|,;:{}()\[\]])\s*/g, '$1')
    .trim();
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">JavaScript</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="input font-mono" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Minified ({out.length} chars)</h2>
          <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[12rem] break-all">{out}</pre>
          {out && <div className="mt-3"><CopyButton text={out} /></div>}
        </div>
      </div>
    </>
  );
});

/* ---------- Base64 ---------- */
export const DevBase64 = makeTool('dev-base64', () => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'enc' | 'dec'>('enc');
  let out = '';
  try {
    out = mode === 'enc' ? btoa(unescape(encodeURIComponent(text))) : decodeURIComponent(escape(atob(text)));
  } catch { out = '⚠ Invalid input'; }
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setMode('enc')} className={`btn-secondary ${mode === 'enc' ? '!border-brand-400 !text-brand-600' : ''}`}>Encode</button>
            <button onClick={() => setMode('dec')} className={`btn-secondary ${mode === 'dec' ? '!border-brand-400 !text-brand-600' : ''}`}>Decode</button>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="input font-mono" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Output</h2>
          <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[10rem] break-all">{out}</pre>
          {out && !out.startsWith('⚠') && <div className="mt-3"><CopyButton text={out} /></div>}
        </div>
      </div>
    </>
  );
});

/* ---------- URL Encode / Decode ---------- */
export const DevUrlEncode = makeTool('dev-url-encode', () => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'enc' | 'dec'>('enc');
  let out = '';
  try { out = mode === 'enc' ? encodeURIComponent(text) : decodeURIComponent(text); } catch { out = '⚠ Invalid input'; }
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setMode('enc')} className={`btn-secondary ${mode === 'enc' ? '!border-brand-400 !text-brand-600' : ''}`}>Encode</button>
            <button onClick={() => setMode('dec')} className={`btn-secondary ${mode === 'dec' ? '!border-brand-400 !text-brand-600' : ''}`}>Decode</button>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="input font-mono" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Output</h2>
          <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[10rem] break-all">{out}</pre>
          {out && !out.startsWith('⚠') && <div className="mt-3"><CopyButton text={out} /></div>}
        </div>
      </div>
    </>
  );
});

/* ---------- UUID ---------- */
export const DevUuid = makeTool('dev-uuid', () => {
  const [count, setCount] = useState(5);
  const [list, setList] = useState<string[]>([]);
  const gen = () => {
    const out: string[] = [];
    for (let i = 0; i < count; i++) out.push(crypto.randomUUID());
    setList(out);
  };
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Options</h2>
          <label className="label">Count: {count}</label>
          <input type="range" min={1} max={50} value={count} onChange={(e) => setCount(+e.target.value)} className="w-full mb-3" />
          <button onClick={gen} className="btn-primary w-full">Generate UUIDs</button>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">UUIDs</h2>
          {list.length ? (
            <>
              <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line">{list.join('\n')}</pre>
              <div className="mt-3"><CopyButton text={list.join('\n')} /></div>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
    </>
  );
});

/* ---------- Color Converter ---------- */
export const DevColorConverter = makeTool('dev-color-converter', () => {
  const [hex, setHex] = useState('#2563eb');
  const toRgb = (h: string) => {
    const m = h.replace('#', '');
    if (m.length !== 6) return null;
    return { r: parseInt(m.slice(0, 2), 16), g: parseInt(m.slice(2, 4), 16), b: parseInt(m.slice(4, 6), 16) };
  };
  const rgb = toRgb(hex);
  const toHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };
  const hsl = rgb ? toHsl(rgb.r, rgb.g, rgb.b) : null;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">HEX</h2>
          <input value={hex} onChange={(e) => setHex(e.target.value)} className="input font-mono" />
          {rgb && <div className="mt-4 h-24 rounded-xl border border-line" style={{ background: hex }} />}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Converted</h2>
          {rgb && hsl ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-line">
                <span className="font-mono text-sm">RGB: {rgb.r}, {rgb.g}, {rgb.b}</span>
                <CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-line">
                <span className="font-mono text-sm">HSL: {hsl.h}, {hsl.s}%, {hsl.l}%</span>
                <CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
              </div>
            </div>
          ) : <ToolEmpty label="Enter a valid hex color." />}
        </div>
      </div>
    </>
  );
});

// Dispatcher for lazy loading by name.
import type { ComponentType } from 'react';
const DEV_COMPONENTS: Record<string, ComponentType<{ onSignIn: () => void }>> = {
  DevJsonFormatter, DevJsonValidator, DevHtmlFormatter, DevCssMinifier, DevJsMinifier,
  DevBase64, DevUrlEncode, DevUuid, DevColorConverter,
};
export default function DeveloperDispatcher({ name, onSignIn }: { name: string; onSignIn: () => void }) {
  const C = DEV_COMPONENTS[name];
  return C ? <C onSignIn={onSignIn} /> : null;
}

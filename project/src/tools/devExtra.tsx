import { useState, useMemo, useRef, useEffect } from 'react';
import { makeTool } from './image';
import { ToolEmpty } from '../components/ToolShell';
import { CopyButton } from '../components/ui';
import { useToast } from '../context/ToastContext';

/* ---------- JWT Decoder ---------- */
export const DevJwtDecoder = makeTool('dev-jwt-decoder', () => {
  const [token, setToken] = useState('');
  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split('.');
    if (parts.length < 2) return { error: 'A JWT must have 3 dot-separated parts.' };
    try {
      const dec = (s: string) => JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')));
      return { header: dec(parts[0]), payload: dec(parts[1]), signature: parts[2] ?? '' };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [token]);

  const fmt = (obj: unknown) => JSON.stringify(obj, null, 2);

  return (
    <>
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">JWT Token</h2>
        <textarea value={token} onChange={(e) => setToken(e.target.value)} rows={4} className="input font-mono text-xs" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature" />
      </div>
      {decoded && 'error' in decoded ? (
        <div className="card p-5 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/30">{decoded.error}</div>
      ) : decoded ? (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-rose-600">Header</h3><CopyButton text={fmt(decoded.header)} /></div>
            <pre className="text-xs font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border overflow-auto max-h-80 text-ink dark:text-dark-text">{fmt(decoded.header)}</pre>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-violet-600">Payload</h3><CopyButton text={fmt(decoded.payload)} /></div>
            <pre className="text-xs font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border overflow-auto max-h-80 text-ink dark:text-dark-text">{fmt(decoded.payload)}</pre>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-sky-600">Signature</h3><CopyButton text={decoded.signature} /></div>
            <pre className="text-xs font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border break-all text-ink dark:text-dark-text">{decoded.signature || '(none)'}</pre>
          </div>
        </div>
      ) : <ToolEmpty label="Paste a JWT token to decode its header, payload and signature." />}
    </>
  );
});

/* ---------- JWT Generator ---------- */
export const DevJwtGenerator = makeTool('dev-jwt-generator', () => {
  const [header, setHeader] = useState('{"alg":"HS256","typ":"JWT"}');
  const [payload, setPayload] = useState('{"sub":"1234567890","name":"John Doe","iat":1516239022}');
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [token, setToken] = useState('');
  const { toast } = useToast();

  const gen = async () => {
    try {
      const enc = (obj: string) => btoa(JSON.stringify(JSON.parse(obj))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const h = enc(header);
      const p = enc(payload);
      const data = new TextEncoder().encode(`${h}.${p}`);
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, data);
      const s = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      setToken(`${h}.${p}.${s}`);
      toast('JWT generated', 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Header (JSON)</h2>
          <textarea value={header} onChange={(e) => setHeader(e.target.value)} rows={3} className="input font-mono text-xs" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Payload (JSON)</h2>
          <textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={3} className="input font-mono text-xs" />
        </div>
      </div>
      <div className="card p-5 mb-6">
        <label className="label">Secret</label>
        <input value={secret} onChange={(e) => setSecret(e.target.value)} className="input font-mono" />
        <button onClick={gen} className="btn-primary mt-4">Generate JWT</button>
      </div>
      {token && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">Token</h2><CopyButton text={token} /></div>
          <pre className="text-xs font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border break-all text-ink dark:text-dark-text">{token}</pre>
        </div>
      )}
    </>
  );
});

/* ---------- Regex Tester ---------- */
export const DevRegexTester = makeTool('dev-regex-tester', () => {
  const [pattern, setPattern] = useState('\\d+');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('Order 123 has 45 items costing $678.90.');
  const [error, setError] = useState<string | null>(null);

  const { matches, highlighted } = useMemo(() => {
    if (!pattern) return { matches: [], highlighted: text };
    try {
      const re = new RegExp(pattern, flags);
      const found: { match: string; index: number; groups: string[] }[] = [];
      let html = '';
      let last = 0;
      let m: RegExpExecArray | null;
      if (flags.includes('g')) {
        while ((m = re.exec(text)) !== null) {
          found.push({ match: m[0], index: m.index, groups: m.slice(1) });
          html += text.slice(last, m.index) + `<mark class="bg-amber-200 dark:bg-amber-600/40 rounded px-0.5">${m[0]}</mark>`;
          last = m.index + m[0].length;
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        m = re.exec(text);
        if (m) {
          found.push({ match: m[0], index: m.index, groups: m.slice(1) });
          html = text.slice(0, m.index) + `<mark class="bg-amber-200 dark:bg-amber-600/40 rounded px-0.5">${m[0]}</mark>` + text.slice(m.index + m[0].length);
          last = text.length;
        }
      }
      html += text.slice(last);
      setError(null);
      return { matches: found, highlighted: html };
    } catch (e) {
      setError((e as Error).message);
      return { matches: [], highlighted: text };
    }
  }, [pattern, flags, text]);

  return (
    <>
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-slate-400 font-mono text-lg">/</span>
          <input value={pattern} onChange={(e) => setPattern(e.target.value)} className="input font-mono !flex-1" placeholder="pattern" />
          <span className="text-slate-400 font-mono text-lg">/</span>
          <input value={flags} onChange={(e) => setFlags(e.target.value)} className="input font-mono !w-20" placeholder="flags" />
        </div>
        {error && <p className="text-sm text-rose-600 mb-2">{error}</p>}
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="input font-mono text-sm" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Highlighted matches</h2>
          <p className="text-sm font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border min-h-[8rem] text-ink dark:text-dark-text" dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Matches ({matches.length})</h2>
          {matches.length === 0 ? <ToolEmpty label="No matches yet." /> : (
            <div className="space-y-2 max-h-72 overflow-auto">
              {matches.map((m, i) => (
                <div key={i} className="flex items-center gap-3 text-sm bg-slate-50 dark:bg-dark-card rounded-lg px-3 py-2 border border-line dark:border-dark-border">
                  <span className="text-slate-400 font-mono text-xs">#{i + 1}</span>
                  <span className="font-mono text-ink dark:text-dark-text">{m.match}</span>
                  <span className="text-slate-400 text-xs ml-auto">@{m.index}</span>
                  {m.groups.length > 0 && <span className="text-xs text-violet-600">groups: {m.groups.join(', ')}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

/* ---------- Regex Generator ---------- */
export const DevRegexGenerator = makeTool('dev-regex-generator', () => {
  const [type, setType] = useState<'email' | 'url' | 'phone' | 'ip' | 'date' | 'number' | 'password'>('email');
  const patterns: Record<string, { regex: string; desc: string }> = {
    email: { regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', desc: 'Matches standard email addresses' },
    url: { regex: '^https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$', desc: 'Matches HTTP/HTTPS URLs' },
    phone: { regex: '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4}$', desc: 'Matches international phone numbers' },
    ip: { regex: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', desc: 'Matches IPv4 addresses' },
    date: { regex: '^\\d{4}[-/]\\d{2}[-/]\\d{2}$', desc: 'Matches YYYY-MM-DD dates' },
    number: { regex: '^-?\\d+(?:\\.\\d+)?$', desc: 'Matches integers and decimals' },
    password: { regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', desc: 'Min 8 chars, upper, lower, digit, special' },
  };
  const current = patterns[type];
  return (
    <>
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Pattern type</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(patterns).map((k) => (
            <button key={k} onClick={() => setType(k as typeof type)} className={`btn-secondary capitalize ${type === k ? '!border-brand-400 !text-brand-600' : ''}`}>{k}</button>
          ))}
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">Generated regex</h2>
          <CopyButton text={current.regex} />
        </div>
        <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border text-ink dark:text-dark-text">/{current.regex}/{current.desc.includes('global') ? 'g' : ''}</pre>
        <p className="text-xs text-slate-500 dark:text-dark-muted mt-2">{current.desc}</p>
      </div>
    </>
  );
});

/* ---------- Hash Generator ---------- */
export const DevHashGenerator = makeTool('dev-hash-generator', () => {
  const [text, setText] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});

  const gen = async () => {
    const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
    const out: Record<string, string> = {};
    const data = new TextEncoder().encode(text);
    for (const algo of algos) {
      const buf = await crypto.subtle.digest(algo, data);
      out[algo] = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    setHashes(out);
  };

  return (
    <>
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Input text</h2>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="input font-mono" placeholder="Text to hash" />
        <button onClick={gen} disabled={!text} className="btn-primary mt-4">Generate hashes</button>
      </div>
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="card p-4">
              <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-brand-600">{algo}</h3><CopyButton text={hash} /></div>
              <pre className="text-xs font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border break-all text-ink dark:text-dark-text">{hash}</pre>
            </div>
          ))}
        </div>
      )}
    </>
  );
});

/* ---------- CSS Gradient Generator ---------- */
export const DevCssGradient = makeTool('dev-css-gradient', () => {
  const [c1, setC1] = useState('#2563eb');
  const [c2, setC2] = useState('#10b981');
  const [angle, setAngle] = useState(90);
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const css = type === 'linear'
    ? `background: linear-gradient(${angle}deg, ${c1}, ${c2});`
    : `background: radial-gradient(circle, ${c1}, ${c2});`;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">Colors</h2>
          <div className="flex gap-2">
            <div className="flex-1"><label className="label">Start</label><input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="w-full h-10 rounded-lg border border-line" /></div>
            <div className="flex-1"><label className="label">End</label><input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="w-full h-10 rounded-lg border border-line" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setType('linear')} className={`btn-secondary ${type === 'linear' ? '!border-brand-400 !text-brand-600' : ''}`}>Linear</button>
            <button onClick={() => setType('radial')} className={`btn-secondary ${type === 'radial' ? '!border-brand-400 !text-brand-600' : ''}`}>Radial</button>
          </div>
          {type === 'linear' && (
            <>
              <label className="label">Angle: {angle}°</label>
              <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full" />
            </>
          )}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Preview</h2>
          <div className="rounded-xl h-48 border border-line" style={{ background: type === 'linear' ? `linear-gradient(${angle}deg, ${c1}, ${c2})` : `radial-gradient(circle, ${c1}, ${c2})` }} />
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">CSS</h2><CopyButton text={css} /></div>
        <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border text-ink dark:text-dark-text">{css}</pre>
      </div>
    </>
  );
});

/* ---------- CSS Box Shadow Generator ---------- */
export const DevCssBoxShadow = makeTool('dev-css-box-shadow', () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(4);
  const [blur, setBlur] = useState(12);
  const [spread, setSpread] = useState(-2);
  const [color, setColor] = useState('#00000020');
  const [inset, setInset] = useState(false);
  const css = `box-shadow: ${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color};`;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">Settings</h2>
          {[['X offset', x, setX, -50, 50], ['Y offset', y, setY, -50, 50], ['Blur', blur, setBlur, 0, 100], ['Spread', spread, setSpread, -50, 50]].map(([label, val, set, min, max]) => (
            <div key={label as string}>
              <label className="label">{label as string}: {val as number}px</label>
              <input type="range" min={min as number} max={max as number} value={val as number} onChange={(e) => (set as (n: number) => void)(+e.target.value)} className="w-full" />
            </div>
          ))}
          <div><label className="label">Color</label><input type="color" value={color.slice(0, 7)} onChange={(e) => setColor(e.target.value + '20')} className="w-full h-10 rounded-lg border border-line" /></div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-dark-muted"><input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} /> Inset</label>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Preview</h2>
          <div className="grid place-items-center h-48 bg-canvas dark:bg-dark-bg rounded-xl">
            <div className="w-32 h-32 bg-white dark:bg-dark-card rounded-xl border border-line dark:border-dark-border" style={{ boxShadow: `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}` }} />
          </div>
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">CSS</h2><CopyButton text={css} /></div>
        <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border text-ink dark:text-dark-text">{css}</pre>
      </div>
    </>
  );
});

/* ---------- CSS Border Radius Generator ---------- */
export const DevCssBorderRadius = makeTool('dev-css-border-radius', () => {
  const [tl, setTl] = useState(16);
  const [tr, setTr] = useState(16);
  const [br, setBr] = useState(16);
  const [bl, setBl] = useState(16);
  const [unit, setUnit] = useState('px');
  const same = tl === tr && tr === br && br === bl;
  const css = same
    ? `border-radius: ${tl}${unit};`
    : `border-radius: ${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit};`;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">Corners</h2>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input !w-auto text-xs"><option>px</option><option>%</option><option>rem</option></select>
          </div>
          {[['Top-left', tl, setTl], ['Top-right', tr, setTr], ['Bottom-right', br, setBr], ['Bottom-left', bl, setBl]].map(([label, val, set]) => (
            <div key={label as string}>
              <label className="label">{label as string}: {val as number}{unit}</label>
              <input type="range" min={0} max={unit === '%' ? 50 : 100} value={val as number} onChange={(e) => (set as (n: number) => void)(+e.target.value)} className="w-full" />
            </div>
          ))}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Preview</h2>
          <div className="grid place-items-center h-48 bg-canvas dark:bg-dark-bg rounded-xl">
            <div className="w-40 h-32 bg-brand-500" style={{ borderRadius: `${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}` }} />
          </div>
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">CSS</h2><CopyButton text={css} /></div>
        <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border text-ink dark:text-dark-text">{css}</pre>
      </div>
    </>
  );
});

/* ---------- CSS Clip-Path Generator ---------- */
export const DevCssClipPath = makeTool('dev-css-clip-path', () => {
  const shapes: Record<string, string> = {
    'Triangle': 'polygon(50% 0%, 0% 100%, 100% 100%)',
    'Trapezoid': 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
    'Parallelogram': 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
    'Rhombus': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    'Pentagon': 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
    'Hexagon': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    'Star': 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    'Arrow': 'polygon(40% 0%, 40% 20%, 100% 20%, 100% 80%, 40% 80%, 40% 100%, 0% 50%)',
  };
  const [shape, setShape] = useState('Hexagon');
  const css = `clip-path: ${shapes[shape]};`;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Shape</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(shapes).map((s) => (
              <button key={s} onClick={() => setShape(s)} className={`btn-secondary text-xs ${shape === s ? '!border-brand-400 !text-brand-600' : ''}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Preview</h2>
          <div className="grid place-items-center h-48 bg-canvas dark:bg-dark-bg rounded-xl">
            <div className="w-40 h-40 bg-brand-500" style={{ clipPath: shapes[shape] }} />
          </div>
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">CSS</h2><CopyButton text={css} /></div>
        <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border text-ink dark:text-dark-text">{css}</pre>
      </div>
    </>
  );
});

/* ---------- CSS Flexbox Generator ---------- */
export const DevCssFlexbox = makeTool('dev-css-flexbox', () => {
  const [dir, setDir] = useState('row');
  const [justify, setJustify] = useState('center');
  const [align, setAlign] = useState('center');
  const [wrap, setWrap] = useState('nowrap');
  const [gap, setGap] = useState(8);
  const css = `display: flex;\nflex-direction: ${dir};\njustify-content: ${justify};\nalign-items: ${align};\nflex-wrap: ${wrap};\ngap: ${gap}px;`;
  const opts = (arr: string[]) => arr.map((v) => <option key={v}>{v}</option>);
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">Properties</h2>
          <div><label className="label">Direction</label><select value={dir} onChange={(e) => setDir(e.target.value)} className="input">{opts(['row','row-reverse','column','column-reverse'])}</select></div>
          <div><label className="label">Justify content</label><select value={justify} onChange={(e) => setJustify(e.target.value)} className="input">{opts(['flex-start','center','flex-end','space-between','space-around','space-evenly'])}</select></div>
          <div><label className="label">Align items</label><select value={align} onChange={(e) => setAlign(e.target.value)} className="input">{opts(['flex-start','center','flex-end','stretch','baseline'])}</select></div>
          <div><label className="label">Wrap</label><select value={wrap} onChange={(e) => setWrap(e.target.value)} className="input">{opts(['nowrap','wrap','wrap-reverse'])}</select></div>
          <div><label className="label">Gap: {gap}px</label><input type="range" min={0} max={40} value={gap} onChange={(e) => setGap(+e.target.value)} className="w-full" /></div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Preview</h2>
          <div className="bg-canvas dark:bg-dark-bg rounded-xl p-4 min-h-[12rem]" style={{ display: 'flex', flexDirection: dir as 'row', justifyContent: justify as 'center', alignItems: align as 'center', flexWrap: wrap as 'nowrap', gap }}>
            {[1,2,3].map((n) => <div key={n} className="w-14 h-14 bg-brand-500 rounded-lg grid place-items-center text-white font-bold">{n}</div>)}
          </div>
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">CSS</h2><CopyButton text={css} /></div>
        <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border text-ink dark:text-dark-text">{css}</pre>
      </div>
    </>
  );
});

/* ---------- CSS Grid Generator ---------- */
export const DevCssGrid = makeTool('dev-css-grid', () => {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(2);
  const [gap, setGap] = useState(8);
  const css = `display: grid;\ngrid-template-columns: repeat(${cols}, 1fr);\ngrid-template-rows: repeat(${rows}, 1fr);\ngap: ${gap}px;`;
  const items = cols * rows;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">Properties</h2>
          <div><label className="label">Columns: {cols}</label><input type="range" min={1} max={6} value={cols} onChange={(e) => setCols(+e.target.value)} className="w-full" /></div>
          <div><label className="label">Rows: {rows}</label><input type="range" min={1} max={6} value={rows} onChange={(e) => setRows(+e.target.value)} className="w-full" /></div>
          <div><label className="label">Gap: {gap}px</label><input type="range" min={0} max={30} value={gap} onChange={(e) => setGap(+e.target.value)} className="w-full" /></div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Preview</h2>
          <div className="bg-canvas dark:bg-dark-bg rounded-xl p-4 min-h-[12rem]" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap }}>
            {Array.from({ length: items }, (_, i) => <div key={i} className="bg-brand-500 rounded-lg grid place-items-center text-white font-bold text-sm">{i+1}</div>)}
          </div>
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">CSS</h2><CopyButton text={css} /></div>
        <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border text-ink dark:text-dark-text">{css}</pre>
      </div>
    </>
  );
});

/* ---------- SVG Viewer & Optimizer ---------- */
export const DevSvgViewer = makeTool('dev-svg-viewer', () => {
  const [svg, setSvg] = useState('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="40" fill="#2563eb" />\n</svg>');
  const optimized = useMemo(() => {
    return svg
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }, [svg]);
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">SVG markup</h2>
          <textarea value={svg} onChange={(e) => setSvg(e.target.value)} rows={10} className="input font-mono text-xs" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-3">Preview</h2>
          <div className="bg-canvas dark:bg-dark-bg rounded-xl p-4 grid place-items-center min-h-[12rem]" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">Optimized ({optimized.length} chars)</h2>
          <CopyButton text={optimized} />
        </div>
        <pre className="text-xs font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border break-all text-ink dark:text-dark-text">{optimized}</pre>
      </div>
    </>
  );
});

/* ---------- Dispatcher ---------- */
import type { ComponentType } from 'react';
const DEV_EXTRA: Record<string, ComponentType<{ onSignIn: () => void }>> = {
  DevJwtDecoder, DevJwtGenerator, DevRegexTester, DevRegexGenerator, DevHashGenerator,
  DevCssGradient, DevCssBoxShadow, DevCssBorderRadius, DevCssClipPath, DevCssFlexbox,
  DevCssGrid, DevSvgViewer,
};
export default function DevExtraDispatcher({ name, onSignIn }: { name: string; onSignIn: () => void }) {
  const C = DEV_EXTRA[name];
  return C ? <C onSignIn={onSignIn} /> : null;
}

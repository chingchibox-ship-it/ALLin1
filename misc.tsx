import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { makeTool } from './image';
import { ToolEmpty } from '../components/ToolShell';
import { CopyButton, Stat } from '../components/ui';
import { download, downloadDataUrl, loadImage, readFileAsDataURL, clamp } from '../lib/files';
import { useAuth } from '../auth/AuthContext';
import { ToolShell, ToolLocked } from '../components/ToolShell';
import { FileDrop } from '../components/FileDrop';

/* ============ Color: Image picker ============ */
export const ColorImagePicker = ({ onSignIn }: { onSignIn: () => void }) => {
  const { user } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [color, setColor] = useState<string | null>(null);
  if (!user) return <ToolLocked onSignIn={onSignIn} />;
  return (
    <ToolShell toolId="color-picker">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Upload image</h2>
          <input type="file" accept="image/*" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const u = await readFileAsDataURL(f);
            setUrl(u); setImg(await loadImage(u)); setColor(null);
          }} className="input" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Click to pick</h2>
          {url ? (
            <div className="rounded-xl border border-line overflow-hidden bg-slate-50 grid place-items-center p-2">
              <img src={url} alt="pick" onClick={(e) => {
                if (!img) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = clamp(Math.floor(((e.clientX - rect.left) / rect.width) * img.naturalWidth), 0, img.naturalWidth - 1);
                const y = clamp(Math.floor(((e.clientY - rect.top) / rect.height) * img.naturalHeight), 0, img.naturalHeight - 1);
                const c = document.createElement('canvas');
                c.width = img.naturalWidth; c.height = img.naturalHeight;
                c.getContext('2d')!.drawImage(img, 0, 0);
                const [r, g, b] = c.getContext('2d')!.getImageData(x, y, 1, 1).data;
                setColor(`#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`);
              }} className="max-h-72 max-w-full object-contain cursor-crosshair" />
            </div>
          ) : <ToolEmpty label="Upload an image, then click anywhere on it." />}
        </div>
      </div>
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Picked color</h2>
        {color ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-line" style={{ background: color }} />
            <div className="font-mono text-lg font-bold text-ink">{color}</div>
            <CopyButton text={color} className="ml-auto" />
          </div>
        ) : <ToolEmpty label="Click on the image to pick a color." />}
      </div>
    </ToolShell>
  );
};

/* ============ Color: Contrast ============ */
function hexToRgb(hex: string) {
  const m = hex.replace('#', '');
  if (m.length !== 6) return null;
  return { r: parseInt(m.slice(0, 2), 16), g: parseInt(m.slice(2, 4), 16), b: parseInt(m.slice(4, 6), 16) };
}
function relLum({ r, g, b }: { r: number; g: number; b: number }) {
  const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export const ColorContrast = ({ onSignIn }: { onSignIn: () => void }) => {
  const { user } = useAuth();
  const [a, setA] = useState('#2563eb');
  const [b, setB] = useState('#ffffff');
  if (!user) return <ToolLocked onSignIn={onSignIn} />;
  const ra = hexToRgb(a), rb = hexToRgb(b);
  let ratio = 1;
  if (ra && rb) {
    const l1 = relLum(ra), l2 = relLum(rb);
    ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  return (
    <ToolShell toolId="color-contrast">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Colors</h2>
          <label className="label">Foreground</label>
          <div className="flex gap-2 mb-3"><input type="color" value={a} onChange={(e) => setA(e.target.value)} className="w-12 h-10 rounded-lg border border-line" /><input value={a} onChange={(e) => setA(e.target.value)} className="input font-mono" /></div>
          <label className="label">Background</label>
          <div className="flex gap-2"><input type="color" value={b} onChange={(e) => setB(e.target.value)} className="w-12 h-10 rounded-lg border border-line" /><input value={b} onChange={(e) => setB(e.target.value)} className="input font-mono" /></div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Preview & ratio</h2>
          <div className="rounded-xl p-6 text-center text-2xl font-bold mb-3" style={{ background: b, color: a }}>The quick brown fox</div>
          <div className="text-3xl font-extrabold text-ink">{ratio.toFixed(2)}:1</div>
          <div className="flex gap-2 mt-2">
            <span className={`chip ${ratio >= 4.5 ? 'bg-accent-50 text-accent-700' : 'bg-rose-50 text-rose-700'}`}>AA {ratio >= 4.5 ? 'Pass' : 'Fail'}</span>
            <span className={`chip ${ratio >= 7 ? 'bg-accent-50 text-accent-700' : 'bg-rose-50 text-rose-700'}`}>AAA {ratio >= 7 ? 'Pass' : 'Fail'}</span>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

/* ============ Color: Palette ============ */
export const ColorPalette = ({ onSignIn }: { onSignIn: () => void }) => {
  const { user } = useAuth();
  const [base, setBase] = useState('#2563eb');
  if (!user) return <ToolLocked onSignIn={onSignIn} />;
  const rgb = hexToRgb(base);
  const hsl = rgb ? (() => {
    let { r, g, b } = rgb; r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; default: h = (r - g) / d + 4; }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  })() : null;
  const palette = hsl ? Array.from({ length: 5 }, (_, i) => {
    const l = clamp(hsl.l - 30 + i * 15, 5, 95);
    return hslToHex(hsl.h, hsl.s, l);
  }) : [];
  return (
    <ToolShell toolId="color-palette">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Base color</h2>
          <div className="flex gap-2"><input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="w-12 h-10 rounded-lg border border-line" /><input value={base} onChange={(e) => setBase(e.target.value)} className="input font-mono" /></div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Palette</h2>
          <div className="flex rounded-xl overflow-hidden border border-line">
            {palette.map((c, i) => (
              <button key={i} onClick={() => navigator.clipboard.writeText(c)} className="flex-1 h-24 flex items-end justify-center pb-2 text-xs font-mono text-white/90" style={{ background: c }} title="Click to copy">{c}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return `#${[f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/* ============ URL: Encoder / Decoder ============ */
export const UrlEncoder = ({ onSignIn }: { onSignIn: () => void }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'enc' | 'dec'>('enc');
  if (!user) return <ToolLocked onSignIn={onSignIn} />;
  let out = '';
  try { out = mode === 'enc' ? encodeURIComponent(text) : decodeURIComponent(text); } catch { out = '⚠ Invalid'; }
  return (
    <ToolShell toolId="url-encoder">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setMode('enc')} className={`btn-secondary ${mode === 'enc' ? '!border-brand-400 !text-brand-600' : ''}`}>Encode</button>
            <button onClick={() => setMode('dec')} className={`btn-secondary ${mode === 'dec' ? '!border-brand-400 !text-brand-600' : ''}`}>Decode</button>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="input font-mono" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Output</h2>
          <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line min-h-[8rem] break-all">{out}</pre>
          {out && !out.startsWith('⚠') && <div className="mt-3"><CopyButton text={out} /></div>}
        </div>
      </div>
    </ToolShell>
  );
};

/* ============ URL: Parser ============ */
export const UrlParser = ({ onSignIn }: { onSignIn: () => void }) => {
  const { user } = useAuth();
  const [text, setText] = useState('https://example.com/path?key=value&q=hello');
  if (!user) return <ToolLocked onSignIn={onSignIn} />;
  let parsed: URL | null = null;
  try { parsed = new URL(text); } catch { parsed = null; }
  return (
    <ToolShell toolId="url-parser">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">URL</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="input font-mono" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Parts</h2>
          {parsed ? (
            <ul className="space-y-1 text-sm font-mono">
              {(['protocol', 'hostname', 'port', 'pathname', 'search', 'hash', 'username', 'password'] as const).map((k) => {
                const v = parsed![k];
                return v ? <li key={k} className="flex justify-between gap-3 px-3 py-1.5 rounded bg-slate-50 border border-line"><span className="text-slate-500">{k}</span><span className="text-ink truncate">{v}</span></li> : null;
              })}
            </ul>
          ) : <ToolEmpty label="Enter a valid URL." />}
        </div>
      </div>
      {parsed && parsed.search && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Query parameters</h2>
          <ul className="space-y-1 text-sm font-mono">
            {Array.from(parsed.searchParams.entries()).map(([k, v], i) => (
              <li key={i} className="flex justify-between gap-3 px-3 py-1.5 rounded bg-slate-50 border border-line"><span className="text-brand-600">{k}</span><span className="text-ink">{v}</span></li>
            ))}
          </ul>
        </div>
      )}
    </ToolShell>
  );
};

/* ============ URL: QR Generator ============ */
export const UrlQr = ({ onSignIn }: { onSignIn: () => void }) => {
  const { user } = useAuth();
  const [text, setText] = useState('https://allin1.app');
  const [size, setSize] = useState(256);
  const [dark, setDark] = useState('#111827');
  const [light, setLight] = useState('#ffffff');
  const [dataUrl, setDataUrl] = useState<string>('');
  if (!user) return <ToolLocked onSignIn={onSignIn} />;

  useEffect(() => {
    if (!text) { setDataUrl(''); return; }
    QRCode.toDataURL(text, { width: size, margin: 2, color: { dark, light } }).then(setDataUrl).catch(() => setDataUrl(''));
  }, [text, size, dark, light]);

  return (
    <ToolShell toolId="url-qr">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Content</h2>
          <label className="label">Text or URL</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="input mb-3" />
          <label className="label">Size: {size}px</label>
          <input type="range" min={128} max={1024} step={32} value={size} onChange={(e) => setSize(+e.target.value)} className="w-full mb-3" />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Foreground</label><input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="w-full h-10 rounded-lg border border-line" /></div>
            <div><label className="label">Background</label><input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="w-full h-10 rounded-lg border border-line" /></div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">QR code</h2>
          {dataUrl ? (
            <div className="text-center">
              <img src={dataUrl} alt="QR" className="mx-auto rounded-xl border border-line" />
              <button onClick={() => downloadDataUrl(dataUrl, 'qr-code.png')} className="btn-primary mt-3">Download PNG</button>
            </div>
          ) : <ToolEmpty label="Enter text to generate a QR code." />}
        </div>
      </div>
    </ToolShell>
  );
};

/* ============ URL: Barcode ============ */
export const UrlBarcode = ({ onSignIn }: { onSignIn: () => void }) => {
  const { user } = useAuth();
  const [text, setText] = useState('123456789012');
  const [fmt, setFmt] = useState('CODE128');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [err, setErr] = useState<string | null>(null);
  if (!user) return <ToolLocked onSignIn={onSignIn} />;

  useEffect(() => {
    if (!canvasRef.current || !text) return;
    try {
      JsBarcode(canvasRef.current, text, { format: fmt, width: 2, height: 80, displayValue: true });
      setErr(null);
    } catch (e) { setErr((e as Error).message); }
  }, [text, fmt]);

  const formats = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'ITF14', 'MSI', 'pharmacode', 'codabar'];

  return (
    <ToolShell toolId="url-barcode">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <label className="label">Value</label>
          <input value={text} onChange={(e) => setText(e.target.value)} className="input mb-3" />
          <label className="label">Format</label>
          <select value={fmt} onChange={(e) => setFmt(e.target.value)} className="input">
            {formats.map((f) => <option key={f}>{f}</option>)}
          </select>
          {err && <p className="text-sm text-rose-600 mt-2">{err}</p>}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Barcode</h2>
          {text && !err ? (
            <div className="text-center">
              <canvas ref={canvasRef} className="mx-auto max-w-full" />
              <button onClick={() => {
                const url = canvasRef.current!.toDataURL('image/png');
                downloadDataUrl(url, 'barcode.png');
              }} className="btn-primary mt-3">Download PNG</button>
            </div>
          ) : <ToolEmpty label="Enter a value for the barcode." />}
        </div>
      </div>
    </ToolShell>
  );
};

/* ============ Utilities: Password generator ============ */
export const UtilPassword = makeTool('util-password', () => {
  const [len, setLen] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [nums, setNums] = useState(true);
  const [syms, setSyms] = useState(true);
  const [pw, setPw] = useState('');
  const gen = () => {
    const sets = [
      upper ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
      lower ? 'abcdefghijklmnopqrstuvwxyz' : '',
      nums ? '0123456789' : '',
      syms ? '!@#$%^&*()-_=+[]{};:,.?/' : '',
    ].filter(Boolean);
    if (sets.length === 0) { setPw(''); return; }
    const all = sets.join('');
    let out = '';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) out += all[arr[i] % all.length];
    setPw(out);
  };
  useEffect(() => { gen(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Options</h2>
          <label className="label">Length: {len}</label>
          <input type="range" min={6} max={64} value={len} onChange={(e) => setLen(+e.target.value)} className="w-full mb-3" />
          <div className="space-y-2 text-sm text-slate-700">
            <label className="flex items-center gap-2"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase (A-Z)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} /> Lowercase (a-z)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={nums} onChange={(e) => setNums(e.target.checked)} /> Numbers (0-9)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={syms} onChange={(e) => setSyms(e.target.checked)} /> Symbols (!@#$…)</label>
          </div>
          <button onClick={gen} className="btn-primary w-full mt-4">Generate</button>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Password</h2>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-lg bg-slate-50 rounded-xl px-3 py-3 border border-line break-all">{pw}</div>
          </div>
          {pw && <div className="mt-3 flex items-center gap-2"><CopyButton text={pw} /></div>}
        </div>
      </div>
    </>
  );
});

/* ============ Utilities: Password strength ============ */
export const UtilPasswordStrength = makeTool('util-password-strength', () => {
  const [pw, setPw] = useState('');
  const score = (() => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return Math.min(s, 5);
  })();
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const colors = ['bg-rose-500', 'bg-rose-400', 'bg-amber-400', 'bg-yellow-400', 'bg-accent-500', 'bg-accent-600'];
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Enter password</h2>
          <input type="text" value={pw} onChange={(e) => setPw(e.target.value)} className="input font-mono" placeholder="Type a password" />
          <div className="flex gap-1 mt-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < score ? colors[score] : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="text-sm font-semibold mt-2 text-ink">{pw ? labels[score] : ''}</div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Checklist</h2>
          <ul className="space-y-2 text-sm">
            <li className={pw.length >= 8 ? 'text-accent-600' : 'text-slate-400'}>At least 8 characters</li>
            <li className={pw.length >= 12 ? 'text-accent-600' : 'text-slate-400'}>At least 12 characters</li>
            <li className={/[a-z]/.test(pw) && /[A-Z]/.test(pw) ? 'text-accent-600' : 'text-slate-400'}>Upper & lower case</li>
            <li className={/\d/.test(pw) ? 'text-accent-600' : 'text-slate-400'}>Has numbers</li>
            <li className={/[^a-zA-Z0-9]/.test(pw) ? 'text-accent-600' : 'text-slate-400'}>Has symbols</li>
          </ul>
        </div>
      </div>
    </>
  );
});

/* ============ Utilities: Stopwatch ============ */
export const UtilStopwatch = makeTool('util-stopwatch', () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const ref = useRef<number | null>(null);
  const start = useRef(0);

  useEffect(() => {
    if (!running) return;
    start.current = Date.now() - elapsed;
    const tick = () => {
      setElapsed(Date.now() - start.current);
      ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const c = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
  };
  return (
    <>
      <div className="card p-8 text-center mb-6">
        <div className="text-6xl font-mono font-bold text-ink tabular-nums">{fmt(elapsed)}</div>
        <div className="flex items-center justify-center gap-3 mt-6">
          {!running ? (
            <button onClick={() => setRunning(true)} className="btn-primary !px-6 !py-3">Start</button>
          ) : (
            <button onClick={() => setRunning(false)} className="btn-secondary !px-6 !py-3">Stop</button>
          )}
          <button onClick={() => { setLaps((l) => [elapsed, ...l]); }} disabled={!running} className="btn-secondary !px-6 !py-3">Lap</button>
          <button onClick={() => { setRunning(false); setElapsed(0); setLaps([]); }} className="btn-ghost !px-6 !py-3">Reset</button>
        </div>
      </div>
      {laps.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Laps</h2>
          <ul className="space-y-1 font-mono text-sm">
            {laps.map((l, i) => <li key={i} className="flex justify-between px-3 py-1.5 rounded bg-slate-50 border border-line"><span>Lap {laps.length - i}</span><span>{fmt(l)}</span></li>)}
          </ul>
        </div>
      )}
    </>
  );
});

/* ============ Utilities: Countdown ============ */
export const UtilCountdown = makeTool('util-countdown', () => {
  const [mins, setMins] = useState(5);
  const [secs, setSecs] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const end = Date.now() + remaining;
    const tick = () => {
      const r = end - Date.now();
      if (r <= 0) {
        setRemaining(0);
        setRunning(false);
        try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=').play(); } catch {}
        return;
      }
      setRemaining(r);
      ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };
  const start = () => {
    if (remaining === 0) setRemaining((mins * 60 + secs) * 1000);
    setRunning(true);
  };

  return (
    <>
      <div className="card p-8 text-center mb-6">
        <div className="text-6xl font-mono font-bold text-ink tabular-nums">{fmt(remaining)}</div>
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="flex gap-2">
            <input type="number" min={0} max={60} value={mins} onChange={(e) => setMins(+e.target.value)} className="input w-20 text-center" disabled={running} />
            <span className="text-slate-400 self-center">:</span>
            <input type="number" min={0} max={59} value={secs} onChange={(e) => setSecs(+e.target.value)} className="input w-20 text-center" disabled={running} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 mt-4">
          {!running ? <button onClick={start} className="btn-primary !px-6 !py-3">Start</button> : <button onClick={() => setRunning(false)} className="btn-secondary !px-6 !py-3">Pause</button>}
          <button onClick={() => { setRunning(false); setRemaining(0); }} className="btn-ghost !px-6 !py-3">Reset</button>
        </div>
      </div>
    </>
  );
});

/* ============ Utilities: Calendar ============ */
export const UtilCalendar = makeTool('util-calendar', () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const startDay = first.getDay();
  const cells: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  return (
    <>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1); }} className="btn-ghost">‹</button>
          <h2 className="text-xl font-bold text-ink">{monthNames[month]} {year}</h2>
          <button onClick={() => { if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1); }} className="btn-ghost">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => (
            <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-sm ${d === null ? '' : isToday(d) ? 'bg-brand-600 text-white font-bold' : 'bg-slate-50 hover:bg-slate-100 text-ink'}`}>
              {d}
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

/* ============ URL: QR Scanner ============ */
export const UrlQrScanner = makeTool('url-qr-scanner', () => {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const { toast } = useToast();

  const stop = () => {
    setScanning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => () => stop(), []);

  const start = async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      detect();
    } catch (e) {
      setError('Could not access camera: ' + (e as Error).message);
    }
  };

  const detect = async () => {
    const BarcodeDetector = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    const video = videoRef.current;
    if (!video || !scanning) return;
    if (BarcodeDetector && video.readyState === 2) {
      try {
        const detector = new BarcodeDetector({ formats: ['qr_code'] });
        const codes = await detector.detect(video);
        if (codes.length > 0) {
          setResult(codes[0].rawValue);
          toast('QR code detected', 'success');
          stop();
          return;
        }
      } catch { /* keep scanning */ }
    }
    rafRef.current = requestAnimationFrame(detect);
  };

  const onFile = async (file: File) => {
    setError(null);
    const img = new Image();
    img.onload = async () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      const BarcodeDetector = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      if (BarcodeDetector) {
        try {
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          const codes = await detector.detect(c);
          if (codes.length > 0) { setResult(codes[0].rawValue); toast('QR code detected', 'success'); return; }
        } catch { /* fall through */ }
      }
      setError('No QR code found in the image. Try a clearer photo or use the camera.');
    };
    img.onerror = () => setError('Could not load image.');
    img.src = URL.createObjectURL(file);
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-4">Camera</h2>
          <div className="relative rounded-xl overflow-hidden bg-slate-900 mb-3 aspect-video grid place-items-center">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {!scanning && <span className="text-slate-400 text-sm absolute">Camera preview</span>}
            {scanning && <div className="absolute inset-8 border-2 border-brand-400/70 rounded-xl" />}
          </div>
          <div className="flex gap-2">
            {!scanning ? (
              <button onClick={start} className="btn-primary flex-1">Start camera scan</button>
            ) : (
              <button onClick={stop} className="btn-secondary flex-1">Stop</button>
            )}
          </div>
          {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-4">Or upload an image</h2>
          <FileDrop accept="image/*" onFiles={(fs) => onFile(fs[0] ?? null)} hint="PNG or JPG with a QR code" />
          <p className="text-xs text-slate-400 mt-3">
            Uses your browser's native BarcodeDetector. Best supported in Chrome and Edge.
          </p>
        </div>
      </div>
      {result && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-2">Scanned result</h2>
          <div className="flex items-center gap-3">
            <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border flex-1 break-all text-ink dark:text-dark-text">{result}</pre>
            <CopyButton text={result} />
            {/^https?:\/\//.test(result) && (
              <a href={result} target="_blank" rel="noreferrer" className="btn-secondary">Open</a>
            )}
          </div>
        </div>
      )}
    </>
  );
});

// Dispatcher for lazy loading by name.
import type { ComponentType } from 'react';
import { useToast } from '../context/ToastContext';
const MISC_COMPONENTS: Record<string, ComponentType<{ onSignIn: () => void }>> = {
  ColorImagePicker, ColorContrast, ColorPalette,
  UrlEncoder, UrlParser, UrlQr, UrlBarcode, UrlQrScanner,
  UtilPassword, UtilPasswordStrength, UtilStopwatch, UtilCountdown, UtilCalendar,
};
export default function MiscDispatcher({ name, onSignIn }: { name: string; onSignIn: () => void }) {
  const C = MISC_COMPONENTS[name];
  return C ? <C onSignIn={onSignIn} /> : null;
}

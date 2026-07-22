import { useState } from 'react';
import { makeTool } from './image';
import { ToolEmpty } from '../components/ToolShell';
import { Stat } from '../components/ui';

/* ---------- Age Calculator ---------- */
export const CalcAge = makeTool('calc-age', () => {
  const [dob, setDob] = useState('');
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const calc = () => {
    if (!dob) return null;
    const d1 = new Date(dob);
    const d2 = new Date(to);
    if (d2 < d1) return null;
    let y = d2.getFullYear() - d1.getFullYear();
    let m = d2.getMonth() - d1.getMonth();
    let d = d2.getDate() - d1.getDate();
    if (d < 0) { m--; d += new Date(d2.getFullYear(), d2.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    const totalDays = Math.floor((d2.getTime() - d1.getTime()) / 86400000);
    return { y, m, d, totalDays };
  };
  const r = calc();
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Dates</h2>
          <label className="label">Date of birth</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="input mb-3" />
          <label className="label">Age at date</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          {r ? (
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Years" value={r.y} accent />
              <Stat label="Months" value={r.m} />
              <Stat label="Days" value={r.d} />
              <Stat label="Total days" value={r.totalDays} />
            </div>
          ) : <ToolEmpty label="Enter your date of birth." />}
        </div>
      </div>
    </>
  );
});

/* ---------- BMI Calculator ---------- */
export const CalcBmi = makeTool('calc-bmi', () => {
  const [h, setH] = useState(170);
  const [w, setW] = useState(65);
  const bmi = h > 0 ? w / Math.pow(h / 100, 2) : 0;
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const color = bmi < 18.5 ? 'text-amber-600' : bmi < 25 ? 'text-accent-600' : bmi < 30 ? 'text-amber-600' : 'text-rose-600';
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Your stats</h2>
          <label className="label">Height: {h} cm</label>
          <input type="range" min={100} max={220} value={h} onChange={(e) => setH(+e.target.value)} className="w-full mb-3" />
          <label className="label">Weight: {w} kg</label>
          <input type="range" min={30} max={200} value={w} onChange={(e) => setW(+e.target.value)} className="w-full" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          <div className="text-5xl font-extrabold text-ink">{bmi.toFixed(1)}</div>
          <div className={`text-lg font-semibold mt-1 ${color}`}>{cat}</div>
          <div className="mt-4 h-3 rounded-full bg-gradient-to-r from-amber-400 via-accent-400 to-rose-500 relative">
            <div className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-ink rounded-full" style={{ left: `${Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>15</span><span>25</span><span>40</span></div>
        </div>
      </div>
    </>
  );
});

/* ---------- Loan Calculator ---------- */
export const CalcLoan = makeTool('calc-loan', () => {
  const [p, setP] = useState(10000);
  const [r, setR] = useState(8);
  const [y, setY] = useState(5);
  const monthly = () => {
    const n = y * 12;
    const rate = r / 100 / 12;
    if (rate === 0) return p / n;
    return (p * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  };
  const m = monthly();
  const total = m * y * 12;
  const interest = total - p;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Loan details</h2>
          <label className="label">Amount: ${p.toLocaleString()}</label>
          <input type="range" min={1000} max={1000000} step={1000} value={p} onChange={(e) => setP(+e.target.value)} className="w-full mb-3" />
          <label className="label">Interest: {r}%</label>
          <input type="range" min={0.1} max={30} step={0.1} value={r} onChange={(e) => setR(+e.target.value)} className="w-full mb-3" />
          <label className="label">Years: {y}</label>
          <input type="range" min={1} max={30} value={y} onChange={(e) => setY(+e.target.value)} className="w-full" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Monthly payment" value={`$${m.toFixed(2)}`} accent />
            <Stat label="Total payment" value={`$${total.toFixed(2)}`} />
            <Stat label="Total interest" value={`$${interest.toFixed(2)}`} />
            <Stat label="Principal" value={`$${p.toLocaleString()}`} />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- EMI Calculator (alias of loan with different copy) ---------- */
export const CalcEmi = makeTool('calc-emi', () => {
  const [p, setP] = useState(500000);
  const [r, setR] = useState(9);
  const [y, setY] = useState(10);
  const emi = () => {
    const n = y * 12;
    const rate = r / 100 / 12;
    if (rate === 0) return p / n;
    return (p * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  };
  const e = emi();
  const total = e * y * 12;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Loan details</h2>
          <label className="label">Principal: {p.toLocaleString()}</label>
          <input type="range" min={10000} max={50000000} step={10000} value={p} onChange={(e) => setP(+e.target.value)} className="w-full mb-3" />
          <label className="label">Rate: {r}%</label>
          <input type="range" min={0.1} max={30} step={0.1} value={r} onChange={(e) => setR(+e.target.value)} className="w-full mb-3" />
          <label className="label">Tenure: {y} years</label>
          <input type="range" min={1} max={30} value={y} onChange={(e) => setY(+e.target.value)} className="w-full" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Monthly EMI" value={e.toFixed(2)} accent />
            <Stat label="Total payable" value={total.toFixed(2)} />
            <Stat label="Total interest" value={(total - p).toFixed(2)} />
            <Stat label="Principal" value={p.toLocaleString()} />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- Percentage Calculator ---------- */
export const CalcPercentage = makeTool('calc-percentage', () => {
  const [mode, setMode] = useState<'of' | 'isWhat' | 'change'>('of');
  const [a, setA] = useState(20);
  const [b, setB] = useState(150);
  const calc = () => {
    if (mode === 'of') return (a / 100) * b;
    if (mode === 'isWhat') return b === 0 ? 0 : (a / b) * 100;
    return a === 0 ? 0 : ((b - a) / a) * 100;
  };
  const result = calc();
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Mode</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setMode('of')} className={`btn-secondary ${mode === 'of' ? '!border-brand-400 !text-brand-600' : ''}`}>X% of Y</button>
            <button onClick={() => setMode('isWhat')} className={`btn-secondary ${mode === 'isWhat' ? '!border-brand-400 !text-brand-600' : ''}`}>X is what % of Y</button>
            <button onClick={() => setMode('change')} className={`btn-secondary ${mode === 'change' ? '!border-brand-400 !text-brand-600' : ''}`}>% change</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">X</label><input type="number" value={a} onChange={(e) => setA(+e.target.value)} className="input" /></div>
            <div><label className="label">Y</label><input type="number" value={b} onChange={(e) => setB(+e.target.value)} className="input" /></div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          <div className="text-5xl font-extrabold text-ink">{result.toFixed(2)}{mode !== 'of' ? '%' : ''}</div>
          <p className="text-sm text-slate-500 mt-2">
            {mode === 'of' && `${a}% of ${b} = ${result.toFixed(2)}`}
            {mode === 'isWhat' && `${a} is ${result.toFixed(2)}% of ${b}`}
            {mode === 'change' && `From ${a} to ${b}: ${result >= 0 ? '+' : ''}${result.toFixed(2)}%`}
          </p>
        </div>
      </div>
    </>
  );
});

/* ---------- Unit Converter ---------- */
export const CalcUnit = makeTool('calc-unit', () => {
  const [cat, setCat] = useState<'length' | 'weight' | 'temperature'>('length');
  const units: Record<string, { name: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]> = {
    length: [
      { name: 'm', toBase: (v) => v, fromBase: (v) => v },
      { name: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { name: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { name: 'mi', toBase: (v) => v * 1609.34, fromBase: (v) => v / 1609.34 },
      { name: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { name: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    ],
    weight: [
      { name: 'kg', toBase: (v) => v, fromBase: (v) => v },
      { name: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { name: 'lb', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
      { name: 'oz', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    ],
    temperature: [
      { name: 'C', toBase: (v) => v, fromBase: (v) => v },
      { name: 'F', toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
      { name: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  };
  const [from, setFrom] = useState(0);
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const list = units[cat];
  const base = list[fromUnit].toBase(from);
  const out = list[toUnit].fromBase(base);
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Convert</h2>
          <div className="flex gap-2 mb-3">
            {(['length', 'weight', 'temperature'] as const).map((c) => (
              <button key={c} onClick={() => { setCat(c); setFromUnit(0); setToUnit(1); }} className={`btn-secondary capitalize ${cat === c ? '!border-brand-400 !text-brand-600' : ''}`}>{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Value</label>
              <input type="number" value={from} onChange={(e) => setFrom(+e.target.value)} className="input" />
              <select value={fromUnit} onChange={(e) => setFromUnit(+e.target.value)} className="input mt-2">
                {list.map((u, i) => <option key={i} value={i}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Result</label>
              <input readOnly value={Number.isFinite(out) ? out.toFixed(4) : ''} className="input" />
              <select value={toUnit} onChange={(e) => setToUnit(+e.target.value)} className="input mt-2">
                {list.map((u, i) => <option key={i} value={i}>{u.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Summary</h2>
          <div className="text-2xl font-bold text-ink">{from} {list[fromUnit].name} = {out.toFixed(4)} {list[toUnit].name}</div>
        </div>
      </div>
    </>
  );
});

/* ---------- Currency Converter (live rates via open.er-api.com) ---------- */
export const CalcCurrency = makeTool('calc-currency', () => {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const codes = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN', 'SGD', 'NZD', 'HKD', 'ZAR'];

  const run = async () => {
    setLoading(true); setErr(null); setResult(null);
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      const rate = data.rates?.[to];
      if (!rate) throw new Error('Rate unavailable');
      setResult(amount * rate);
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Convert</h2>
          <label className="label">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="input mb-3" />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">From</label><select value={from} onChange={(e) => setFrom(e.target.value)} className="input">{codes.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">To</label><select value={to} onChange={(e) => setTo(e.target.value)} className="input">{codes.map((c) => <option key={c}>{c}</option>)}</select></div>
          </div>
          <button onClick={run} disabled={loading} className="btn-primary w-full mt-4">{loading ? 'Fetching…' : 'Convert'}</button>
          {err && <p className="text-sm text-rose-600 mt-2">{err}</p>}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          {result !== null ? (
            <div>
              <div className="text-3xl font-bold text-ink">{result.toFixed(2)} {to}</div>
              <p className="text-sm text-slate-500 mt-2">{amount} {from}</p>
              <p className="text-xs text-slate-400 mt-1">Rate: 1 {from} = {(result / amount).toFixed(4)} {to}</p>
            </div>
          ) : <ToolEmpty label="Click Convert to fetch the latest rate." />}
        </div>
      </div>
    </>
  );
});

/* ---------- Time Zone Converter ---------- */
export const CalcTimezone = makeTool('calc-timezone', () => {
  const zones = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'];
  const [time, setTime] = useState(new Date().toISOString().slice(0, 16));
  const [fromZone, setFromZone] = useState('UTC');
  const date = new Date(time + 'Z'); // treat input as UTC for simplicity
  const fmt = (z: string) => new Intl.DateTimeFormat('en-US', { timeZone: z, dateStyle: 'medium', timeStyle: 'long' }).format(date);
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input (UTC)</h2>
          <label className="label">Date & time</label>
          <input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} className="input mb-3" />
          <label className="label">From zone</label>
          <select value={fromZone} onChange={(e) => setFromZone(e.target.value)} className="input">
            {zones.map((z) => <option key={z}>{z}</option>)}
          </select>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Around the world</h2>
          <ul className="space-y-2">
            {zones.map((z) => (
              <li key={z} className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-50 border border-line">
                <span className="text-sm font-medium text-ink">{z}</span>
                <span className="text-sm text-slate-600">{fmt(z)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
});

// Dispatcher for lazy loading by name.
import type { ComponentType } from 'react';
const CALC_COMPONENTS: Record<string, ComponentType<{ onSignIn: () => void }>> = {
  CalcAge, CalcBmi, CalcLoan, CalcEmi, CalcPercentage, CalcUnit, CalcCurrency, CalcTimezone,
};
export default function CalculatorsDispatcher({ name, onSignIn }: { name: string; onSignIn: () => void }) {
  const C = CALC_COMPONENTS[name];
  return C ? <C onSignIn={onSignIn} /> : null;
}

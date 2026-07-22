import { useState } from 'react';
import { makeTool } from './image';
import { Stat } from '../components/ui';

/* ---------- Discount Calculator ---------- */
export const CalcDiscount = makeTool('calc-discount', () => {
  const [price, setPrice] = useState(100);
  const [discount, setDiscount] = useState(20);
  const savings = (price * discount) / 100;
  const final = price - savings;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-4">Details</h2>
          <label className="label">Original price: {price}</label>
          <input type="range" min={0} max={10000} step={1} value={price} onChange={(e) => setPrice(+e.target.value)} className="w-full mb-3" />
          <label className="label">Discount: {discount}%</label>
          <input type="range" min={0} max={100} step={1} value={discount} onChange={(e) => setDiscount(+e.target.value)} className="w-full" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-4">Result</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="You save" value={savings.toFixed(2)} accent />
            <Stat label="Final price" value={final.toFixed(2)} />
            <Stat label="Discount" value={`${discount}%`} />
            <Stat label="Original" value={price.toFixed(2)} />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- GST Calculator ---------- */
export const CalcGst = makeTool('calc-gst', () => {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const gst = mode === 'add' ? (amount * rate) / 100 : (amount * rate) / (100 + rate);
  const base = mode === 'add' ? amount : amount - gst;
  const total = mode === 'add' ? amount + gst : amount;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-4">Details</h2>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setMode('add')} className={`btn-secondary ${mode === 'add' ? '!border-brand-400 !text-brand-600' : ''}`}>Add GST</button>
            <button onClick={() => setMode('remove')} className={`btn-secondary ${mode === 'remove' ? '!border-brand-400 !text-brand-600' : ''}`}>Remove GST</button>
          </div>
          <label className="label">Amount: {amount}</label>
          <input type="range" min={0} max={1000000} step={10} value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full mb-3" />
          <label className="label">GST rate: {rate}%</label>
          <input type="range" min={0} max={28} step={1} value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-4">Result</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Base amount" value={base.toFixed(2)} accent />
            <Stat label="GST" value={gst.toFixed(2)} />
            <Stat label="Total" value={total.toFixed(2)} />
            <Stat label="Rate" value={`${rate}%`} />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- Time Calculator ---------- */
export const CalcTime = makeTool('calc-time', () => {
  const [h1, setH1] = useState(2);
  const [m1, setM1] = useState(30);
  const [s1, setS1] = useState(0);
  const [h2, setH2] = useState(1);
  const [m2, setM2] = useState(45);
  const [s2, setS2] = useState(30);
  const [op, setOp] = useState<'add' | 'sub'>('add');
  const t1 = h1 * 3600 + m1 * 60 + s1;
  const t2 = h2 * 3600 + m2 * 60 + s2;
  const result = op === 'add' ? t1 + t2 : Math.max(0, t1 - t2);
  const rh = Math.floor(result / 3600);
  const rm = Math.floor((result % 3600) / 60);
  const rs = result % 60;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-4">Time values</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setOp('add')} className={`btn-secondary ${op === 'add' ? '!border-brand-400 !text-brand-600' : ''}`}>Add</button>
            <button onClick={() => setOp('sub')} className={`btn-secondary ${op === 'sub' ? '!border-brand-400 !text-brand-600' : ''}`}>Subtract</button>
          </div>
          <label className="label">Time 1</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <input type="number" min={0} value={h1} onChange={(e) => setH1(+e.target.value)} className="input text-center" placeholder="h" />
            <input type="number" min={0} max={59} value={m1} onChange={(e) => setM1(+e.target.value)} className="input text-center" placeholder="m" />
            <input type="number" min={0} max={59} value={s1} onChange={(e) => setS1(+e.target.value)} className="input text-center" placeholder="s" />
          </div>
          <label className="label">Time 2</label>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" min={0} value={h2} onChange={(e) => setH2(+e.target.value)} className="input text-center" placeholder="h" />
            <input type="number" min={0} max={59} value={m2} onChange={(e) => setM2(+e.target.value)} className="input text-center" placeholder="m" />
            <input type="number" min={0} max={59} value={s2} onChange={(e) => setS2(+e.target.value)} className="input text-center" placeholder="s" />
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text mb-4">Result</h2>
          <div className="text-4xl font-extrabold text-ink dark:text-dark-text">{rh}h {rm}m {rs}s</div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Stat label="Total hours" value={(result / 3600).toFixed(2)} accent />
            <Stat label="Total minutes" value={Math.floor(result / 60)} />
            <Stat label="Total seconds" value={result} />
            <Stat label="Operation" value={op === 'add' ? 'Added' : 'Subtracted'} />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- Dispatcher ---------- */
import type { ComponentType } from 'react';
const CALC_EXTRA: Record<string, ComponentType<{ onSignIn: () => void }>> = {
  CalcDiscount, CalcGst, CalcTime,
};
export default function CalcExtraDispatcher({ name, onSignIn }: { name: string; onSignIn: () => void }) {
  const C = CALC_EXTRA[name];
  return C ? <C onSignIn={onSignIn} /> : null;
}

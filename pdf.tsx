import { useState } from 'react';
import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib';
import { ToolShell, ToolLocked, ToolEmpty } from '../components/ToolShell';
import { FileDrop } from '../components/FileDrop';
import { download, formatBytes, readFileAsArrayBuffer, readFileAsDataURL, loadImage } from '../lib/files';
import { useAuth } from '../auth/AuthContext';

function PdfTool({ toolId, children, onSignIn }: { toolId: string; children: React.ReactNode; onSignIn?: () => void }) {
  const { user } = useAuth();
  if (!user) return <ToolLocked onSignIn={onSignIn ?? (() => {})} />;
  return <ToolShell toolId={toolId}>{children}</ToolShell>;
}

function PdfDrop({ onFiles, files, multiple, hint }: { onFiles: (f: File[]) => void; files: File[]; multiple?: boolean; hint?: string }) {
  return <FileDrop accept="application/pdf" multiple={multiple} onFiles={onFiles} files={files} onRemove={(i) => onFiles(files.filter((_, idx) => idx !== i))} hint={hint} />;
}

async function loadPdf(file: File): Promise<PDFDocument> {
  const bytes = await readFileAsArrayBuffer(file);
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

function DownloadBtn({ bytes, filename, disabled }: { bytes: Uint8Array | null; filename: string; disabled?: boolean }) {
  if (!bytes || disabled) return <ToolEmpty label="Run the tool to generate your PDF." />;
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return (
    <div className="text-center">
      <div className="text-sm text-slate-600 mb-3">Ready — <span className="font-semibold text-ink">{formatBytes(blob.size)}</span></div>
      <button onClick={() => download(blob, filename)} className="btn-primary">Download PDF</button>
    </div>
  );
}

/* ---------- Merge ---------- */
export const PdfMerge = ({ onSignIn }: { onSignIn: () => void }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [out, setOut] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (files.length < 2) return;
    setBusy(true);
    try {
      const merged = await PDFDocument.create();
      for (const f of files) {
        const doc = await loadPdf(f);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      setOut(await merged.save());
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-merge" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">PDF files</h2><PdfDrop onFiles={(f) => { setFiles(f); setOut(null); }} files={files} multiple hint="Add 2 or more PDFs in order" /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Merge</h2>
          {files.length >= 2 ? (
            <>
              <p className="text-sm text-slate-600 mb-3">{files.length} PDFs ready. They will be merged in the order shown.</p>
              <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Merging…' : 'Merge PDFs'}</button>
            </>
          ) : <ToolEmpty label="Add at least 2 PDF files." />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadBtn bytes={out} filename="merged.pdf" /></div>
    </PdfTool>
  );
};

/* ---------- Split ---------- */
export const PdfSplit = ({ onSignIn }: { onSignIn: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState('1-1');
  const [out, setOut] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);

  const parseRanges = (s: string): number[] => {
    return s.split(',').flatMap((part) => {
      const [a, b] = part.trim().split('-').map((n) => parseInt(n, 10));
      if (Number.isNaN(a)) return [];
      return Number.isNaN(b) ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i);
    });
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await loadPdf(file);
      const indices = parseRanges(ranges);
      const out2 = await PDFDocument.create();
      const pages = await out2.copyPages(src, indices.filter((i) => i > 0 && i <= src.getPageCount()).map((i) => i - 1));
      pages.forEach((p) => out2.addPage(p));
      setOut(await out2.save());
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-split" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">PDF file</h2><FileDrop accept="application/pdf" onFiles={(f) => { setFile(f[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Page ranges</h2>
          {file ? (
            <>
              <label className="label">Ranges (e.g. 1-3, 5, 8-10)</label>
              <input value={ranges} onChange={(e) => setRanges(e.target.value)} className="input mb-3" placeholder="1-3, 5, 8-10" />
              <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Splitting…' : 'Extract pages'}</button>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadBtn bytes={out} filename="split.pdf" /></div>
    </PdfTool>
  );
};

/* ---------- Compress (re-save lighter) ---------- */
export const PdfCompress = ({ onSignIn }: { onSignIn: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [out, setOut] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);
  const [origSize, setOrigSize] = useState(0);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await loadPdf(file);
      setOrigSize(file.size);
      setOut(await src.save({ useObjectStreams: true }));
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-compress" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">PDF file</h2><FileDrop accept="application/pdf" onFiles={(f) => { setFile(f[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Compress</h2>
          {file ? (
            <>
              <p className="text-sm text-slate-600 mb-3">Original: {formatBytes(file.size)}</p>
              <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Compressing…' : 'Compress PDF'}</button>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
        {out ? (
          <div className="text-center">
            <div className="text-sm text-slate-600 mb-1">Compressed: <span className="font-semibold text-ink">{formatBytes(out.byteLength)}</span></div>
            {origSize > out.byteLength && <div className="text-xs text-accent-600 mb-3">Saved {Math.round((1 - out.byteLength / origSize) * 100)}%</div>}
            <button onClick={() => download(new Blob([out as BlobPart], { type: 'application/pdf' }), 'compressed.pdf')} className="btn-primary">Download PDF</button>
          </div>
        ) : <ToolEmpty />}
      </div>
    </PdfTool>
  );
};

/* ---------- Rotate ---------- */
export const PdfRotate = ({ onSignIn }: { onSignIn: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [out, setOut] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const doc = await loadPdf(file);
      doc.getPages().forEach((p) => {
        const cur = p.getRotation().angle;
        p.setRotation(degrees((cur + angle) % 360));
      });
      setOut(await doc.save());
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-rotate" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">PDF file</h2><FileDrop accept="application/pdf" onFiles={(f) => { setFile(f[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Rotation</h2>
          {file ? (
            <>
              <div className="flex gap-2 mb-3">
                {[90, 180, 270].map((a) => (
                  <button key={a} onClick={() => setAngle(a)} className={`btn-secondary ${angle === a ? '!border-brand-400 !text-brand-600' : ''}`}>{a}°</button>
                ))}
              </div>
              <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Rotating…' : 'Rotate all pages'}</button>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadBtn bytes={out} filename="rotated.pdf" /></div>
    </PdfTool>
  );
};

/* ---------- Delete pages ---------- */
export const PdfDeletePages = ({ onSignIn }: { onSignIn: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState('');
  const [out, setOut] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await loadPdf(file);
      const total = src.getPageCount();
      const toDelete = new Set(pages.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n) && n > 0 && n <= total));
      const keep = Array.from({ length: total }, (_, i) => i).filter((i) => !toDelete.has(i + 1));
      const out2 = await PDFDocument.create();
      const copied = await out2.copyPages(src, keep);
      copied.forEach((p) => out2.addPage(p));
      setOut(await out2.save());
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-delete-pages" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">PDF file</h2><FileDrop accept="application/pdf" onFiles={(f) => { setFile(f[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Pages to delete</h2>
          {file ? (
            <>
              <label className="label">Page numbers (comma separated)</label>
              <input value={pages} onChange={(e) => setPages(e.target.value)} className="input mb-3" placeholder="2, 5, 7" />
              <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Working…' : 'Delete pages'}</button>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadBtn bytes={out} filename="deleted-pages.pdf" /></div>
    </PdfTool>
  );
};

/* ---------- Extract pages ---------- */
export const PdfExtractPages = ({ onSignIn }: { onSignIn: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState('');
  const [out, setOut] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await loadPdf(file);
      const total = src.getPageCount();
      const wanted = pages.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n) && n > 0 && n <= total);
      const out2 = await PDFDocument.create();
      const copied = await out2.copyPages(src, wanted.map((n) => n - 1));
      copied.forEach((p) => out2.addPage(p));
      setOut(await out2.save());
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-extract-pages" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">PDF file</h2><FileDrop accept="application/pdf" onFiles={(f) => { setFile(f[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Pages to extract</h2>
          {file ? (
            <>
              <label className="label">Page numbers (comma separated)</label>
              <input value={pages} onChange={(e) => setPages(e.target.value)} className="input mb-3" placeholder="1, 3, 5" />
              <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Working…' : 'Extract pages'}</button>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadBtn bytes={out} filename="extracted.pdf" /></div>
    </PdfTool>
  );
};

/* ---------- Rearrange (swap pairs) ---------- */
export const PdfRearrange = ({ onSignIn }: { onSignIn: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState('');
  const [out, setOut] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);
  const [total, setTotal] = useState(0);

  const onFile = async (f: File | null) => {
    setFile(f);
    setOut(null);
    if (f) {
      const doc = await loadPdf(f);
      setTotal(doc.getPageCount());
      setOrder(Array.from({ length: doc.getPageCount() }, (_, i) => i + 1).join(','));
    }
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await loadPdf(file);
      const wanted = order.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n) && n > 0 && n <= total);
      const out2 = await PDFDocument.create();
      const copied = await out2.copyPages(src, wanted.map((n) => n - 1));
      copied.forEach((p) => out2.addPage(p));
      setOut(await out2.save());
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-rearrange" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">PDF file</h2><FileDrop accept="application/pdf" onFiles={(f) => onFile(f[0] ?? null)} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">New order</h2>
          {file ? (
            <>
              <p className="text-xs text-slate-500 mb-2">{total} pages. Enter a comma-separated list in the new order.</p>
              <input value={order} onChange={(e) => setOrder(e.target.value)} className="input mb-3" />
              <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Working…' : 'Rearrange'}</button>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadBtn bytes={out} filename="rearranged.pdf" /></div>
    </PdfTool>
  );
};

/* ---------- JPG to PDF ---------- */
export const PdfJpgToPdf = ({ onSignIn }: { onSignIn: () => void }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [out, setOut] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (files.length === 0) return;
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      for (const f of files) {
        const bytes = await readFileAsArrayBuffer(f);
        const isPng = f.type.includes('png');
        const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      setOut(await doc.save());
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-jpg-to-pdf" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Images</h2><FileDrop accept="image/jpeg,image/png" multiple onFiles={(f) => { setFiles(f); setOut(null); }} files={files} onRemove={(i) => setFiles(files.filter((_, idx) => idx !== i))} hint="JPG or PNG images" /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Convert</h2>
          {files.length > 0 ? (
            <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Converting…' : `Make PDF from ${files.length} image${files.length === 1 ? '' : 's'}`}</button>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadBtn bytes={out} filename="images.pdf" /></div>
    </PdfTool>
  );
};

/* ---------- PDF to JPG (page 1 render via canvas) ---------- */
export const PdfToJpg = ({ onSignIn }: { onSignIn: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [imgs, setImgs] = useState<string[]>([]);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      // Render via embedded PDF.js worker from a CDN-less approach: use pdf-lib to extract? 
      // pdf-lib cannot rasterize. We use a lightweight canvas-based approach via the browser's
      // built-in PDF rendering through an <iframe> + print? Instead we fall back to embedding
      // page count and offering each page as PDF→image by drawing onto canvas through the
      // external pdf.js. To stay dependency-light we use pdfjs-dist via dynamic import.
      const pdfjs: any = await import('pdfjs-dist/build/pdf.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs')).default;
      const bytes = await readFileAsArrayBuffer(file);
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      const out: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const c = document.createElement('canvas');
        c.width = viewport.width; c.height = viewport.height;
        await page.render({ canvasContext: c.getContext('2d')!, viewport }).promise;
        out.push(c.toDataURL('image/jpeg', 0.9));
      }
      setImgs(out);
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-to-jpg" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">PDF file</h2><FileDrop accept="application/pdf" onFiles={(f) => { setFile(f[0] ?? null); setImgs([]); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Convert</h2>
          {file ? <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Rendering…' : 'Render to JPG'}</button> : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Pages ({imgs.length})</h2>
        {imgs.length === 0 ? <ToolEmpty label="Render the PDF to see page images." /> : (
          <div className="grid grid-cols-3 gap-2">
            {imgs.map((src, i) => (
              <a key={i} href={src} download={`page-${i + 1}.jpg`} className="rounded-lg border border-line overflow-hidden bg-slate-50 hover:border-brand-400 block">
                <img src={src} alt={`Page ${i + 1}`} className="w-full h-32 object-contain" />
                <div className="text-[10px] text-center text-slate-500 py-1">Page {i + 1}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </PdfTool>
  );
};

/* ---------- Page numbers ---------- */
export const PdfPageNumbers = ({ onSignIn }: { onSignIn: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [out, setOut] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState<'bottom-center' | 'bottom-right'>('bottom-center');

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const doc = await loadPdf(file);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      doc.getPages().forEach((page, i) => {
        const { width, height } = page.getSize();
        const txt = `${i + 1}`;
        const w = font.widthOfTextAtSize(txt, 11);
        const x = pos === 'bottom-right' ? width - w - 24 : width / 2 - w / 2;
        page.drawText(txt, { x, y: 18, size: 11, font, color: rgb(0.2, 0.2, 0.2) });
      });
      setOut(await doc.save());
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-page-numbers" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">PDF file</h2><FileDrop accept="application/pdf" onFiles={(f) => { setFile(f[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Position</h2>
          {file ? (
            <>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setPos('bottom-center')} className={`btn-secondary ${pos === 'bottom-center' ? '!border-brand-400 !text-brand-600' : ''}`}>Bottom center</button>
                <button onClick={() => setPos('bottom-right')} className={`btn-secondary ${pos === 'bottom-right' ? '!border-brand-400 !text-brand-600' : ''}`}>Bottom right</button>
              </div>
              <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Adding…' : 'Add page numbers'}</button>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadBtn bytes={out} filename="numbered.pdf" /></div>
    </PdfTool>
  );
};

/* ---------- Watermark ---------- */
export const PdfWatermark = ({ onSignIn }: { onSignIn: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [out, setOut] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const doc = await loadPdf(file);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      doc.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const size = 48;
        const w = font.widthOfTextAtSize(text, size);
        page.drawText(text, {
          x: width / 2 - w / 2,
          y: height / 2,
          size,
          font,
          color: rgb(0.85, 0.15, 0.15),
          opacity: 0.25,
          rotate: degrees(45),
        });
      });
      setOut(await doc.save());
    } finally { setBusy(false); }
  };

  return (
    <PdfTool toolId="pdf-watermark" onSignIn={onSignIn}>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">PDF file</h2><FileDrop accept="application/pdf" onFiles={(f) => { setFile(f[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Watermark text</h2>
          {file ? (
            <>
              <input value={text} onChange={(e) => setText(e.target.value)} className="input mb-3" />
              <button onClick={run} disabled={busy} className="btn-primary w-full">{busy ? 'Adding…' : 'Add watermark'}</button>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadBtn bytes={out} filename="watermarked.pdf" /></div>
    </PdfTool>
  );
};

export { loadImage };

// Dispatcher for lazy loading by name.
import type { ComponentType } from 'react';
const PDF_COMPONENTS: Record<string, ComponentType<{ onSignIn: () => void }>> = {
  PdfMerge, PdfSplit, PdfCompress, PdfRotate, PdfDeletePages, PdfExtractPages,
  PdfRearrange, PdfJpgToPdf, PdfToJpg, PdfPageNumbers, PdfWatermark,
};
export default function PdfDispatcher({ name, onSignIn }: { name: string; onSignIn: () => void }) {
  const C = PDF_COMPONENTS[name];
  return C ? <C onSignIn={onSignIn} /> : null;
}

import { useState, type ReactNode } from 'react';
import { ToolShell, ToolLocked, ToolEmpty, ToolLoading } from '../components/ToolShell';
import { FileDrop } from '../components/FileDrop';
import { CopyButton } from '../components/ui';
import {
  download,
  downloadDataUrl,
  formatBytes,
  readFileAsDataURL,
  loadImage,
  canvasToBlob,
  clamp,
} from '../lib/files';
import { useAuth } from '../auth/AuthContext';

export function makeTool(
  toolId: string,
  render: (args: { onSignIn: () => void }) => ReactNode
) {
  return function ToolComponent({ onSignIn }: { onSignIn: () => void }) {
    const { user } = useAuth();
    if (!user) return <ToolLocked onSignIn={onSignIn} />;
    return (
      <ToolShell toolId={toolId}>
        {render({ onSignIn })}
      </ToolShell>
    );
  };
}

// Hook used by image tools to keep a single source image.
function useImage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);

  const set = async (f: File | null) => {
    setFile(f);
    setUrl(null);
    setImg(null);
    if (f) {
      setLoading(true);
      try {
        const dataUrl = await readFileAsDataURL(f);
        setUrl(dataUrl);
        setImg(await loadImage(dataUrl));
      } finally {
        setLoading(false);
      }
    }
  };

  return { file, url, img, loading, setFile: set };
}

function ImagePreview({ url, alt }: { url: string | null; alt: string }) {
  if (!url) return <ToolEmpty label="Upload an image to preview it here." />;
  return (
    <div className="rounded-xl border border-line overflow-hidden bg-slate-50 grid place-items-center p-2">
      <img src={url} alt={alt} className="max-h-72 max-w-full object-contain" />
    </div>
  );
}

function DownloadResult({ blob, filename, type }: { blob: Blob | null; filename: string; type?: string }) {
  if (!blob) return <ToolEmpty label="Adjust the options and run the tool to see your result." />;
  return (
    <div className="text-center">
      <div className="text-sm text-slate-600 mb-3">
        Ready — <span className="font-semibold text-ink">{formatBytes(blob.size)}</span>
        {type && <span className="text-slate-400 ml-1">· {type}</span>}
      </div>
      <button onClick={() => download(blob, filename)} className="btn-primary">Download</button>
    </div>
  );
}

/* ---------------- Compress ---------------- */
export const ImageCompress = makeTool('image-compress', () => {
  const { file, img, url, setFile, loading } = useImage();
  const [quality, setQuality] = useState(70);
  const [out, setOut] = useState<Blob | null>(null);

  const run = async () => {
    if (!img) return;
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const blob = await canvasToBlob(c, 'image/jpeg', quality / 100);
    setOut(blob);
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <FileDrop accept="image/*" onFiles={(fs) => { setFile(fs[0] ?? null); setOut(null); }} hint="JPG, PNG, WebP" />
          {loading && <div className="text-xs text-slate-400 mt-2">Loading…</div>}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Preview</h2>
          <ImagePreview url={url} alt="Source" />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Options</h2>
          {file ? (
            <>
              <div className="text-xs text-slate-500 mb-3">Original: {formatBytes(file.size)}</div>
              <label className="label">Quality: {quality}%</label>
              <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-full" />
              <button onClick={run} disabled={!img} className="btn-primary w-full mt-4">Compress</button>
            </>
          ) : <ToolEmpty label="Upload an image to begin." />}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          <DownloadResult blob={out} filename="compressed.jpg" type="JPEG" />
        </div>
      </div>
    </>
  );
});

/* ---------------- Resize ---------------- */
export const ImageResize = makeTool('image-resize', () => {
  const { img, url, setFile, loading } = useImage();
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [lock, setLock] = useState(true);
  const [out, setOut] = useState<Blob | null>(null);

  const onFile = async (f: File | null) => {
    await setFile(f);
    if (f) {
      const dataUrl = await readFileAsDataURL(f);
      const i = await loadImage(dataUrl);
      setW(i.naturalWidth);
      setH(i.naturalHeight);
    }
    setOut(null);
  };

  const setWidth = (nw: number) => {
    if (!img) return;
    if (lock && img.naturalWidth) {
      const ratio = img.naturalHeight / img.naturalWidth;
      setW(nw);
      setH(Math.round(nw * ratio));
    } else setW(nw);
  };
  const setHeight = (nh: number) => {
    if (!img) return;
    if (lock && img.naturalHeight) {
      const ratio = img.naturalWidth / img.naturalHeight;
      setH(nh);
      setW(Math.round(nh * ratio));
    } else setH(nh);
  };

  const run = async () => {
    if (!img || !w || !h) return;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d')!.drawImage(img, 0, 0, w, h);
    setOut(await canvasToBlob(c, 'image/png'));
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <FileDrop accept="image/*" onFiles={(fs) => onFile(fs[0] ?? null)} />
          {loading && <div className="text-xs text-slate-400 mt-2">Loading…</div>}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Preview</h2>
          <ImagePreview url={url} alt="Source" />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Dimensions</h2>
          {img ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Width</label>
                  <input type="number" value={w} onChange={(e) => setWidth(+e.target.value)} className="input" />
                </div>
                <div>
                  <label className="label">Height</label>
                  <input type="number" value={h} onChange={(e) => setHeight(+e.target.value)} className="input" />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm text-slate-600">
                <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Lock aspect ratio
              </label>
              <button onClick={run} className="btn-primary w-full mt-4">Resize</button>
            </>
          ) : <ToolEmpty label="Upload an image to begin." />}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          <DownloadResult blob={out} filename="resized.png" type="PNG" />
        </div>
      </div>
    </>
  );
});

/* ---------------- Crop ---------------- */
export const ImageCrop = makeTool('image-crop', () => {
  const { img, url, setFile } = useImage();
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [out, setOut] = useState<Blob | null>(null);

  const onFile = async (f: File | null) => {
    await setFile(f);
    setOut(null);
    if (f) {
      const i = await loadImage(await readFileAsDataURL(f));
      setX(0); setY(0);
      setW(Math.floor(i.naturalWidth / 2));
      setH(Math.floor(i.naturalHeight / 2));
    }
  };

  const run = async () => {
    if (!img) return;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d')!.drawImage(img, x, y, w, h, 0, 0, w, h);
    setOut(await canvasToBlob(c, 'image/png'));
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2><FileDrop accept="image/*" onFiles={(fs) => onFile(fs[0] ?? null)} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Preview</h2><ImagePreview url={url} alt="Source" /></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Crop region</h2>
          {img ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">X</label><input type="number" value={x} max={img.naturalWidth} onChange={(e) => setX(+e.target.value)} className="input" /></div>
                <div><label className="label">Y</label><input type="number" value={y} max={img.naturalHeight} onChange={(e) => setY(+e.target.value)} className="input" /></div>
                <div><label className="label">Width</label><input type="number" value={w} max={img.naturalWidth - x} onChange={(e) => setW(+e.target.value)} className="input" /></div>
                <div><label className="label">Height</label><input type="number" value={h} max={img.naturalHeight - y} onChange={(e) => setH(+e.target.value)} className="input" /></div>
              </div>
              <button onClick={run} className="btn-primary w-full mt-4">Crop</button>
            </>
          ) : <ToolEmpty />}
        </div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadResult blob={out} filename="cropped.png" type="PNG" /></div>
      </div>
    </>
  );
});

/* ---------------- Rotate ---------------- */
export const ImageRotate = makeTool('image-rotate', () => {
  const { img, url, setFile } = useImage();
  const [angle, setAngle] = useState(90);
  const [out, setOut] = useState<Blob | null>(null);

  const run = async () => {
    if (!img) return;
    const rad = (angle * Math.PI) / 180;
    const c = document.createElement('canvas');
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    c.width = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
    c.height = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);
    const ctx = c.getContext('2d')!;
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    setOut(await canvasToBlob(c, 'image/png'));
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2><FileDrop accept="image/*" onFiles={(fs) => { setFile(fs[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Preview</h2><ImagePreview url={url} alt="Source" /></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Angle</h2>
          {img ? (
            <>
              <div className="flex gap-2 mb-3">
                {[90, 180, 270].map((a) => (
                  <button key={a} onClick={() => setAngle(a)} className={`btn-secondary ${angle === a ? '!border-brand-400 !text-brand-600' : ''}`}>{a}°</button>
                ))}
              </div>
              <label className="label">Custom: {angle}°</label>
              <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full" />
              <button onClick={run} className="btn-primary w-full mt-4">Rotate</button>
            </>
          ) : <ToolEmpty />}
        </div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadResult blob={out} filename="rotated.png" type="PNG" /></div>
      </div>
    </>
  );
});

/* ---------------- Flip ---------------- */
export const ImageFlip = makeTool('image-flip', () => {
  const { img, url, setFile } = useImage();
  const [mode, setMode] = useState<'h' | 'v' | 'both'>('h');
  const [out, setOut] = useState<Blob | null>(null);

  const run = async () => {
    if (!img) return;
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    if (mode === 'h' || mode === 'both') { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    if (mode === 'v' || mode === 'both') { ctx.translate(0, c.height); ctx.scale(1, -1); }
    ctx.drawImage(img, 0, 0);
    setOut(await canvasToBlob(c, 'image/png'));
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2><FileDrop accept="image/*" onFiles={(fs) => { setFile(fs[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Preview</h2><ImagePreview url={url} alt="Source" /></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Direction</h2>
          {img ? (
            <>
              <div className="flex gap-2">
                <button onClick={() => setMode('h')} className={`btn-secondary ${mode === 'h' ? '!border-brand-400 !text-brand-600' : ''}`}>Horizontal</button>
                <button onClick={() => setMode('v')} className={`btn-secondary ${mode === 'v' ? '!border-brand-400 !text-brand-600' : ''}`}>Vertical</button>
                <button onClick={() => setMode('both')} className={`btn-secondary ${mode === 'both' ? '!border-brand-400 !text-brand-600' : ''}`}>Both</button>
              </div>
              <button onClick={run} className="btn-primary w-full mt-4">Flip</button>
            </>
          ) : <ToolEmpty />}
        </div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadResult blob={out} filename="flipped.png" type="PNG" /></div>
      </div>
    </>
  );
});

/* ---------------- Convert ---------------- */
export const ImageConvert = makeTool('image-convert', () => {
  const { img, url, setFile } = useImage();
  const [fmt, setFmt] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/png');
  const [out, setOut] = useState<Blob | null>(null);

  const run = async () => {
    if (!img) return;
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    if (fmt === 'image/jpeg' || fmt === 'image/webp') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.drawImage(img, 0, 0);
    setOut(await canvasToBlob(c, fmt, 0.92));
  };

  const ext = fmt === 'image/jpeg' ? 'jpg' : fmt === 'image/webp' ? 'webp' : 'png';

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2><FileDrop accept="image/*" onFiles={(fs) => { setFile(fs[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Preview</h2><ImagePreview url={url} alt="Source" /></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Format</h2>
          {img ? (
            <>
              <div className="flex gap-2">
                {(['image/png', 'image/jpeg', 'image/webp'] as const).map((f) => (
                  <button key={f} onClick={() => setFmt(f)} className={`btn-secondary ${fmt === f ? '!border-brand-400 !text-brand-600' : ''}`}>
                    {f === 'image/png' ? 'PNG' : f === 'image/jpeg' ? 'JPG' : 'WebP'}
                  </button>
                ))}
              </div>
              <button onClick={run} className="btn-primary w-full mt-4">Convert</button>
            </>
          ) : <ToolEmpty />}
        </div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadResult blob={out} filename={`converted.${ext}`} type={ext.toUpperCase()} /></div>
      </div>
    </>
  );
});

/* ---------------- Watermark ---------------- */
export const ImageWatermark = makeTool('image-watermark', () => {
  const { img, url, setFile } = useImage();
  const [text, setText] = useState('© Allin1');
  const [opacity, setOpacity] = useState(50);
  const [size, setSize] = useState(48);
  const [out, setOut] = useState<Blob | null>(null);

  const run = async () => {
    if (!img) return;
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    ctx.font = `${size}px Inter, sans-serif`;
    ctx.fillStyle = `rgba(255,255,255,${opacity / 100})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillText(text, c.width / 2, c.height / 2);
    setOut(await canvasToBlob(c, 'image/png'));
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2><FileDrop accept="image/*" onFiles={(fs) => { setFile(fs[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Preview</h2><ImagePreview url={url} alt="Source" /></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Watermark</h2>
          {img ? (
            <>
              <label className="label">Text</label>
              <input value={text} onChange={(e) => setText(e.target.value)} className="input mb-3" />
              <label className="label">Opacity: {opacity}%</label>
              <input type="range" min={10} max={100} value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="w-full mb-3" />
              <label className="label">Size: {size}px</label>
              <input type="range" min={12} max={200} value={size} onChange={(e) => setSize(+e.target.value)} className="w-full mb-3" />
              <button onClick={run} className="btn-primary w-full mt-1">Apply watermark</button>
            </>
          ) : <ToolEmpty />}
        </div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadResult blob={out} filename="watermarked.png" type="PNG" /></div>
      </div>
    </>
  );
});

/* ---------------- EXIF removal ---------------- */
export const ImageExif = makeTool('image-exif', () => {
  const { img, url, setFile, file } = useImage();
  const [out, setOut] = useState<Blob | null>(null);

  const run = async () => {
    if (!img) return;
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d')!.drawImage(img, 0, 0);
    // Re-encoding via canvas strips EXIF. Preserve PNG for lossless.
    setOut(await canvasToBlob(c, 'image/png'));
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2><FileDrop accept="image/*" onFiles={(fs) => { setFile(fs[0] ?? null); setOut(null); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Preview</h2><ImagePreview url={url} alt="Source" /></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Strip metadata</h2>
          {file ? (
            <>
              <p className="text-sm text-slate-600 mb-3">
                Re-encoding the image through canvas removes all EXIF, GPS and camera metadata.
              </p>
              <button onClick={run} className="btn-primary w-full">Remove metadata</button>
            </>
          ) : <ToolEmpty />}
        </div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadResult blob={out} filename="clean.png" type="PNG" /></div>
      </div>
    </>
  );
});

/* ---------------- Color picker ---------------- */
export const ImageColorPicker = makeTool('image-color-picker', () => {
  const { img, url, setFile } = useImage();
  const canvasRef = useState<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState<string | null>(null);

  const onPick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * img.naturalHeight);
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const [r, g, b] = ctx.getImageData(clamp(x, 0, c.width - 1), clamp(y, 0, c.height - 1), 1, 1).data;
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    setColor(hex);
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2><FileDrop accept="image/*" onFiles={(fs) => setFile(fs[0] ?? null)} hint="Click the image to pick a color" /></div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Pick a pixel</h2>
          {url ? (
            <div className="rounded-xl border border-line overflow-hidden bg-slate-50 grid place-items-center p-2">
              <img src={url} alt="Pick" onClick={onPick} className="max-h-72 max-w-full object-contain cursor-crosshair" />
            </div>
          ) : <ToolEmpty label="Upload an image, then click anywhere on it." />}
        </div>
      </div>
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Picked color</h2>
        {color ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-line" style={{ background: color }} />
            <div>
              <div className="font-mono text-lg font-bold text-ink">{color}</div>
              <div className="text-xs text-slate-500 uppercase">{color.toUpperCase()}</div>
            </div>
            <CopyButton text={color} className="ml-auto" />
          </div>
        ) : <ToolEmpty label="Click on the image to pick a color." />}
      </div>
      {/* canvasRef kept to avoid unused var lint in some setups */}
      <span className="hidden">{String(!!canvasRef)}</span>
    </>
  );
});

/* ---------------- Splitter ---------------- */
export const ImageSplit = makeTool('image-split', () => {
  const { img, url, setFile } = useImage();
  const [cols, setCols] = useState(2);
  const [rows, setRows] = useState(2);
  const [outs, setOuts] = useState<Blob[]>([]);

  const run = async () => {
    if (!img) return;
    const tw = Math.floor(img.naturalWidth / cols);
    const th = Math.floor(img.naturalHeight / rows);
    const blobs: Blob[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const canvas = document.createElement('canvas');
        canvas.width = tw; canvas.height = th;
        canvas.getContext('2d')!.drawImage(img, c * tw, r * th, tw, th, 0, 0, tw, th);
        blobs.push(await canvasToBlob(canvas, 'image/png'));
      }
    }
    setOuts(blobs);
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2><FileDrop accept="image/*" onFiles={(fs) => { setFile(fs[0] ?? null); setOuts([]); }} /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Preview</h2><ImagePreview url={url} alt="Source" /></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Grid</h2>
          {img ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Columns</label><input type="number" min={1} max={10} value={cols} onChange={(e) => setCols(+e.target.value)} className="input" /></div>
                <div><label className="label">Rows</label><input type="number" min={1} max={10} value={rows} onChange={(e) => setRows(+e.target.value)} className="input" /></div>
              </div>
              <button onClick={run} className="btn-primary w-full mt-4">Split into {rows * cols} tiles</button>
            </>
          ) : <ToolEmpty />}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Tiles</h2>
          {outs.length === 0 ? <ToolEmpty /> : (
            <div className="grid grid-cols-3 gap-2">
              {outs.map((b, i) => (
                <button key={i} onClick={() => download(b, `tile-${i + 1}.png`)} className="rounded-lg border border-line overflow-hidden bg-slate-50 hover:border-brand-400">
                  <img src={URL.createObjectURL(b)} alt={`Tile ${i + 1}`} className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

/* ---------------- Merge ---------------- */
export const ImageMerge = makeTool('image-merge', () => {
  const [files, setFiles] = useState<File[]>([]);
  const [imgs, setImgs] = useState<HTMLImageElement[]>([]);
  const [direction, setDirection] = useState<'h' | 'v'>('h');
  const [out, setOut] = useState<Blob | null>(null);

  const onFiles = async (fs: File[]) => {
    setFiles(fs);
    setOut(null);
    const loaded = await Promise.all(fs.map(async (f) => loadImage(await readFileAsDataURL(f))));
    setImgs(loaded);
  };

  const run = async () => {
    if (imgs.length === 0) return;
    if (direction === 'h') {
      const w = imgs.reduce((s, i) => s + i.naturalWidth, 0);
      const h = Math.max(...imgs.map((i) => i.naturalHeight));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d')!;
      let x = 0;
      for (const i of imgs) { ctx.drawImage(i, x, 0); x += i.naturalWidth; }
      setOut(await canvasToBlob(c, 'image/png'));
    } else {
      const h = imgs.reduce((s, i) => s + i.naturalHeight, 0);
      const w = Math.max(...imgs.map((i) => i.naturalWidth));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d')!;
      let y = 0;
      for (const i of imgs) { ctx.drawImage(i, 0, y); y += i.naturalHeight; }
      setOut(await canvasToBlob(c, 'image/png'));
    }
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Input images</h2><FileDrop accept="image/*" multiple onFiles={onFiles} files={files} onRemove={(i) => { const f = files.filter((_, idx) => idx !== i); onFiles(f); }} hint="Add 2 or more images" /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Direction</h2>
          {imgs.length > 0 ? (
            <>
              <div className="flex gap-2">
                <button onClick={() => setDirection('h')} className={`btn-secondary ${direction === 'h' ? '!border-brand-400 !text-brand-600' : ''}`}>Horizontal</button>
                <button onClick={() => setDirection('v')} className={`btn-secondary ${direction === 'v' ? '!border-brand-400 !text-brand-600' : ''}`}>Vertical</button>
              </div>
              <button onClick={run} className="btn-primary w-full mt-4">Merge {imgs.length} images</button>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadResult blob={out} filename="merged.png" type="PNG" /></div>
    </>
  );
});

/* ---------------- Collage ---------------- */
export const ImageCollage = makeTool('image-collage', () => {
  const [files, setFiles] = useState<File[]>([]);
  const [imgs, setImgs] = useState<HTMLImageElement[]>([]);
  const [layout, setLayout] = useState<2 | 3 | 4>(3);
  const [out, setOut] = useState<Blob | null>(null);

  const onFiles = async (fs: File[]) => {
    setFiles(fs);
    setOut(null);
    const loaded = await Promise.all(fs.map(async (f) => loadImage(await readFileAsDataURL(f))));
    setImgs(loaded);
  };

  const run = async () => {
    if (imgs.length === 0) return;
    const cell = 400;
    const gap = 12;
    const n = layout;
    const cols = n;
    const rows = Math.ceil(imgs.length / cols);
    const w = cols * cell + (cols + 1) * gap;
    const h = rows * cell + (rows + 1) * gap;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    imgs.slice(0, n * rows).forEach((im, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = gap + col * (cell + gap);
      const y = gap + row * (cell + gap);
      // cover fit
      const scale = Math.max(cell / im.naturalWidth, cell / im.naturalHeight);
      const dw = im.naturalWidth * scale;
      const dh = im.naturalHeight * scale;
      ctx.drawImage(im, x + (cell - dw) / 2, y + (cell - dh) / 2, dw, dh);
    });
    setOut(await canvasToBlob(c, 'image/png'));
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Photos</h2><FileDrop accept="image/*" multiple onFiles={onFiles} files={files} onRemove={(i) => { const f = files.filter((_, idx) => idx !== i); onFiles(f); }} hint="Upload up to 9 images" /></div>
        <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Layout</h2>
          {imgs.length > 0 ? (
            <>
              <div className="flex gap-2">
                {([2, 3, 4] as const).map((n) => (
                  <button key={n} onClick={() => setLayout(n)} className={`btn-secondary ${layout === n ? '!border-brand-400 !text-brand-600' : ''}`}>{n} columns</button>
                ))}
              </div>
              <button onClick={run} className="btn-primary w-full mt-4">Make collage</button>
            </>
          ) : <ToolEmpty />}
        </div>
      </div>
      <div className="card p-5"><h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2><DownloadResult blob={out} filename="collage.png" type="PNG" /></div>
    </>
  );
});

// Re-export helper to avoid unused warnings in some bundlers
export { downloadDataUrl };

// Dispatcher for lazy loading by name.
import type { ComponentType } from 'react';
const IMAGE_COMPONENTS: Record<string, ComponentType<{ onSignIn: () => void }>> = {
  ImageCompress, ImageResize, ImageCrop, ImageRotate, ImageFlip, ImageConvert,
  ImageWatermark, ImageExif, ImageColorPicker, ImageSplit, ImageMerge, ImageCollage,
};
export default function ImageDispatcher({ name, onSignIn }: { name: string; onSignIn: () => void }) {
  const C = IMAGE_COMPONENTS[name];
  return C ? <C onSignIn={onSignIn} /> : null;
}

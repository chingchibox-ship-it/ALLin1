import { useState } from 'react';
import { makeTool } from './image';
import { ToolEmpty } from '../components/ToolShell';
import { Stat, CopyButton } from '../components/ui';

/* ---------- YouTube Thumbnail Downloader ---------- */
function thumbnailUrl(id: string, quality: 'max' | 'hq' | 'mq' | 'sd'): string {
  const q = quality === 'max' ? 'maxresdefault' : quality === 'hq' ? 'hqdefault' : quality === 'mq' ? 'mqdefault' : 'sddefault';
  return `https://img.youtube.com/vi/${id}/${q}.jpg`;
}
function extractId(input: string): string | null {
  const m = input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(input.trim()) ? input.trim() : null;
}

export const YtThumbnailDownloader = makeTool('yt-thumbnail-downloader', () => {
  const [input, setInput] = useState('');
  const [id, setId] = useState<string | null>(null);
  const [quality, setQuality] = useState<'max' | 'hq' | 'mq' | 'sd'>('hq');
  const [err, setErr] = useState<string | null>(null);
  const [found, setFound] = useState<Record<string, boolean>>({});

  const go = () => {
    const vid = extractId(input);
    if (!vid) { setErr('Could not find a YouTube video ID.'); setId(null); return; }
    setErr(null); setId(vid);
  };

  const url = id ? thumbnailUrl(id, quality) : null;

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <label className="label">YouTube URL or video ID</label>
          <input value={input} onChange={(e) => setInput(e.target.value)} className="input mb-3" placeholder="https://youtube.com/watch?v=…" />
          <button onClick={go} className="btn-primary w-full">Load thumbnails</button>
          {err && <p className="text-sm text-rose-600 mt-2">{err}</p>}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Quality</h2>
          {id ? (
            <div className="flex flex-wrap gap-2">
              {(['max', 'hq', 'mq', 'sd'] as const).map((q) => (
                <button key={q} onClick={() => setQuality(q)} className={`btn-secondary ${quality === q ? '!border-brand-400 !text-brand-600' : ''}`}>
                  {q === 'max' ? 'Max (1280)' : q === 'hq' ? 'HQ (480)' : q === 'mq' ? 'MQ (320)' : 'SD (640)'}
                </button>
              ))}
            </div>
          ) : <ToolEmpty label="Enter a YouTube URL to load thumbnails." />}
        </div>
      </div>
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Thumbnail</h2>
        {url ? (
          <div className="text-center">
            <div className="rounded-xl overflow-hidden border border-line bg-slate-50 inline-block">
              <img src={url} alt="thumbnail" className="max-h-80" onError={() => setFound((f) => ({ ...f, [quality]: false }))} onLoad={() => setFound((f) => ({ ...f, [quality]: true }))} />
            </div>
            {found[quality] === false && <p className="text-xs text-rose-500 mt-2">This resolution is not available for this video.</p>}
            {found[quality] !== false && (
              <div className="mt-3 flex justify-center gap-2">
                <a href={url} download={`yt-${id}-${quality}.jpg`} target="_blank" rel="noreferrer" className="btn-primary">Download</a>
                <CopyButton text={url} />
              </div>
            )}
          </div>
        ) : <ToolEmpty />}
      </div>
    </>
  );
});

/* ---------- YouTube Thumbnail Preview ---------- */
export const YtThumbnailPreview = makeTool('yt-thumbnail-preview', () => {
  const [input, setInput] = useState('');
  const [id, setId] = useState<string | null>(null);

  const go = () => setId(extractId(input));
  const url = id ? thumbnailUrl(id, 'max') : null;

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <input value={input} onChange={(e) => setInput(e.target.value)} className="input mb-3" placeholder="YouTube URL or ID" />
          <button onClick={go} className="btn-primary w-full">Preview</button>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">How it looks</h2>
          {url ? (
            <div className="rounded-xl overflow-hidden border border-line bg-white">
              <div className="bg-slate-900 text-white text-xs px-3 py-2 flex items-center gap-2">
                <span className="font-semibold">YouTube</span>
              </div>
              <div className="relative">
                <img src={url} alt="thumb" className="w-full" onError={(e) => ((e.target as HTMLImageElement).src = thumbnailUrl(id!, 'hq'))} />
              </div>
            </div>
          ) : <ToolEmpty />}
        </div>
      </div>
    </>
  );
});

/* ---------- YouTube Thumbnail Size Checker ---------- */
export const YtThumbnailSize = makeTool('yt-thumbnail-size', () => {
  const [input, setInput] = useState('');
  const [info, setInfo] = useState<{ w: number; h: number; ok: boolean } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const check = async () => {
    const id = extractId(input);
    if (!id) { setErr('Could not find a video ID.'); setInfo(null); return; }
    setErr(null);
    const url = thumbnailUrl(id, 'max');
    const img = new Image();
    img.onload = () => {
      const ok = img.naturalWidth === 1280 && img.naturalHeight === 720;
      setInfo({ w: img.naturalWidth, h: img.naturalHeight, ok });
    };
    img.onerror = () => setErr('Max-res thumbnail not available.');
    img.src = url;
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Input</h2>
          <input value={input} onChange={(e) => setInput(e.target.value)} className="input mb-3" placeholder="YouTube URL or ID" />
          <button onClick={check} className="btn-primary w-full">Check size</button>
          {err && <p className="text-sm text-rose-600 mt-2">{err}</p>}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Result</h2>
          {info ? (
            <div>
              <div className="text-lg font-bold text-ink">{info.w} × {info.h}px</div>
              <div className={`chip mt-2 ${info.ok ? 'bg-accent-50 text-accent-700' : 'bg-amber-50 text-amber-700'}`}>
                {info.ok ? 'Matches 1280×720 spec' : 'Does not match 1280×720'}
              </div>
            </div>
          ) : <ToolEmpty />}
        </div>
      </div>
    </>
  );
});

/* ---------- YouTube Tag Counter ---------- */
export const YtTagCounter = makeTool('yt-tag-counter', () => {
  const [text, setText] = useState('');
  const tags = text.split(',').map((t) => t.trim()).filter(Boolean);
  const chars = text.length;
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Tags (comma separated)</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="input font-mono" placeholder="how to, tutorial, 2024" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Counts</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Tags" value={tags.length} accent />
            <Stat label="Characters" value={chars} />
            <Stat label="Limit" value="500 chars" />
            <Stat label="Remaining" value={Math.max(0, 500 - chars)} />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- YouTube Title Counter ---------- */
export const YtTitleCounter = makeTool('yt-title-counter', () => {
  const [text, setText] = useState('');
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Title</h2>
          <input value={text} onChange={(e) => setText(e.target.value)} className="input" placeholder="Your video title" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Counts</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Characters" value={text.length} accent />
            <Stat label="Limit" value="100" />
            <Stat label="Remaining" value={Math.max(0, 100 - text.length)} />
            <Stat label="Status" value={text.length > 100 ? 'Too long' : 'OK'} />
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full ${text.length > 100 ? 'bg-rose-500' : 'bg-brand-600'}`} style={{ width: `${Math.min(100, (text.length / 100) * 100)}%` }} />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- YouTube Description Counter ---------- */
export const YtDescriptionCounter = makeTool('yt-description-counter', () => {
  const [text, setText] = useState('');
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Description</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="input" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Counts</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Characters" value={text.length} accent />
            <Stat label="Words" value={text.trim() ? text.trim().split(/\s+/).length : 0} />
            <Stat label="Lines" value={text ? text.split('\n').length : 0} />
            <Stat label="Limit" value="5000" />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- YouTube Timestamp Generator ---------- */
export const YtTimestamps = makeTool('yt-timestamps', () => {
  const [input, setInput] = useState('0:00 Intro\n1:23 First step\n3:45 Demo');
  const lines = input.split('\n').filter(Boolean);
  const out = lines.map((l) => {
    const m = l.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.*)$/);
    if (!m) return l;
    return `${m[1]} ${m[2]}`;
  }).join('\n');
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Times + labels</h2>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="input font-mono" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Chapters</h2>
          <pre className="text-sm font-mono whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-line">{out}</pre>
          <div className="mt-3"><CopyButton text={out} /></div>
        </div>
      </div>
    </>
  );
});

/* ---------- TikTok Caption Checker ---------- */
export const TiktokCaptionChecker = makeTool('tiktok-caption-checker', () => {
  const [text, setText] = useState('');
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Caption</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="input" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Counts</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Characters" value={text.length} accent />
            <Stat label="Limit" value="2200" />
            <Stat label="Hashtags" value={(text.match(/#\w+/g) || []).length} />
            <Stat label="Remaining" value={Math.max(0, 2200 - text.length)} />
          </div>
        </div>
      </div>
    </>
  );
});

export const TiktokHashtagCounter = makeTool('tiktok-hashtag-counter', () => {
  const [text, setText] = useState('');
  const tags = text.match(/#\w+/g) || [];
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Caption</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="input" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Hashtags</h2>
          <Stat label="Hashtag count" value={tags.length} accent />
          {tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{tags.map((t, i) => <span key={i} className="chip bg-fuchsia-50 text-fuchsia-700">{t}</span>)}</div>}
        </div>
      </div>
    </>
  );
});

export const TiktokUsernameChecker = makeTool('tiktok-username-checker', () => {
  const [name, setName] = useState('');
  const valid = /^[A-Za-z0-9._]{2,24}$/.test(name) && !name.startsWith('.') && !/[._]{2}/.test(name);
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Username</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="username" maxLength={24} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Check</h2>
          {name ? (
            <div className={`chip ${valid ? 'bg-accent-50 text-accent-700' : 'bg-rose-50 text-rose-700'}`}>
              {valid ? 'Valid format' : 'Invalid — use letters, numbers, . and _ only (2-24 chars)'}
            </div>
          ) : <ToolEmpty />}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Stat label="Length" value={name.length} />
            <Stat label="Max" value="24" />
          </div>
        </div>
      </div>
    </>
  );
});

export const TiktokBioCounter = makeTool('tiktok-bio-counter', () => {
  const [text, setText] = useState('');
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Bio</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="input" maxLength={80} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Counts</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Characters" value={text.length} accent />
            <Stat label="Limit" value="80" />
            <Stat label="Remaining" value={Math.max(0, 80 - text.length)} />
          </div>
        </div>
      </div>
    </>
  );
});

/* ---------- Instagram Grid Preview ---------- */
export const IgGridPreview = makeTool('ig-grid-preview', () => {
  const [urls, setUrls] = useState<string[]>([]);
  const onFiles = async (files: File[]) => {
    const readers = await Promise.all(files.map(async (f) => {
      return await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(f);
      });
    }));
    setUrls(readers);
  };
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Upload posts</h2>
          <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && onFiles(Array.from(e.target.files))} className="input" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Grid preview</h2>
          {urls.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {urls.map((u, i) => <div key={i} className="aspect-square overflow-hidden bg-slate-100"><img src={u} alt="" className="w-full h-full object-cover" /></div>)}
            </div>
          ) : <ToolEmpty />}
        </div>
      </div>
    </>
  );
});

export const IgBioCounter = makeTool('ig-bio-counter', () => {
  const [text, setText] = useState('');
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Bio</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="input" maxLength={150} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Counts</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Characters" value={text.length} accent />
            <Stat label="Limit" value="150" />
            <Stat label="Remaining" value={Math.max(0, 150 - text.length)} />
          </div>
        </div>
      </div>
    </>
  );
});

export const IgHashtagCounter = makeTool('ig-hashtag-counter', () => {
  const [text, setText] = useState('');
  const tags = text.match(/#\w+/g) || [];
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Caption</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="input" />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Hashtags</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Count" value={tags.length} accent />
            <Stat label="Limit" value="30" />
          </div>
          {tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{tags.map((t, i) => <span key={i} className="chip bg-fuchsia-50 text-fuchsia-700">{t}</span>)}</div>}
        </div>
      </div>
    </>
  );
});

/* ---------- Shared Content Generator UI ---------- */
import {
  generateYouTube, generateTikTok, generateInstagram, generateFacebook, generateTwitter,
  TONE_OPTIONS, LANGUAGE_OPTIONS, type GeneratorInput, type GeneratedContent,
} from '../lib/socialGenerator';
import { useToast } from '../context/ToastContext';

function GeneratorForm({
  input, setInput, onGenerate, label,
}: {
  input: GeneratorInput;
  setInput: (i: GeneratorInput) => void;
  onGenerate: () => void;
  label: string;
}) {
  return (
    <div className="card p-5 space-y-3">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-dark-text">Configuration</h2>
      <div>
        <label className="label">Topic / subject</label>
        <input
          value={input.topic}
          onChange={(e) => setInput({ ...input, topic: e.target.value })}
          className="input"
          placeholder="e.g. morning routine, machine learning, pizza recipes"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <input
            value={input.category}
            onChange={(e) => setInput({ ...input, category: e.target.value })}
            className="input"
            placeholder="lifestyle, tech, food"
          />
        </div>
        <div>
          <label className="label">Tone</label>
          <select
            value={input.tone}
            onChange={(e) => setInput({ ...input, tone: e.target.value as GeneratorInput['tone'] })}
            className="input"
          >
            {TONE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Language</label>
          <select
            value={input.language}
            onChange={(e) => setInput({ ...input, language: e.target.value as GeneratorInput['language'] })}
            className="input"
          >
            {LANGUAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Keywords (comma separated)</label>
          <input
            value={input.keywords.join(', ')}
            onChange={(e) => setInput({ ...input, keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            className="input"
            placeholder="beginner, fast, free"
          />
        </div>
      </div>
      <button onClick={onGenerate} disabled={!input.topic.trim()} className="btn-primary w-full">
        {label}
      </button>
    </div>
  );
}

function Block({ title, text, mono = false }: { title: string; text: string | string[]; mono?: boolean }) {
  const content = Array.isArray(text) ? text.join('\n') : text;
  if (!content.trim()) return null;
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-dark-text">{title}</h3>
        <CopyButton text={content} />
      </div>
      <pre className={`text-sm ${mono ? 'font-mono' : ''} whitespace-pre-wrap bg-slate-50 dark:bg-dark-card rounded-lg p-3 border border-line dark:border-dark-border max-h-72 overflow-auto text-ink dark:text-dark-text`}>{content}</pre>
    </div>
  );
}

function ListBlock({ title, items, accent }: { title: string; items: string[]; accent?: string }) {
  if (!items.length) return null;
  const text = items.join('\n');
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-dark-text">{title} <span className="text-xs text-slate-400 font-normal">({items.length})</span></h3>
        <CopyButton text={text} />
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-auto">
        {items.map((it, i) => (
          <span key={i} className={`chip ${accent ?? 'bg-brand-50 text-brand-700 dark:bg-dark-card dark:text-brand-300'}`}>{it}</span>
        ))}
      </div>
    </div>
  );
}

function GeneratorResults({ result, platform }: { result: GeneratedContent; platform: string }) {
  const { toast } = useToast();
  const all = [
    ...result.titles, result.description, ...result.tags, ...result.hashtags,
    ...result.hooks, ...result.ctas, ...result.seoKeywords, ...result.thumbnailText,
  ].join('\n');
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { navigator.clipboard.writeText(all); toast('All content copied', 'success'); }} className="btn-ghost text-xs">
          Copy everything
        </button>
      </div>
      <ListBlock title="Titles" items={result.titles} accent="bg-brand-50 text-brand-700 dark:bg-dark-card dark:text-brand-300" />
      <Block title="Description" text={result.description} />
      <div className="grid md:grid-cols-2 gap-4">
        <ListBlock title="Tags" items={result.tags} accent="bg-amber-50 text-amber-700 dark:bg-dark-card dark:text-amber-300" />
        <ListBlock title="Hashtags" items={result.hashtags} accent="bg-fuchsia-50 text-fuchsia-700 dark:bg-dark-card dark:text-fuchsia-300" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <ListBlock title="Hooks" items={result.hooks} accent="bg-emerald-50 text-emerald-700 dark:bg-dark-card dark:text-emerald-300" />
        <ListBlock title="Call-to-actions" items={result.ctas} accent="bg-rose-50 text-rose-700 dark:bg-dark-card dark:text-rose-300" />
      </div>
      {result.thumbnailText.length > 0 && (
        <ListBlock title="Thumbnail text ideas" items={result.thumbnailText} accent="bg-violet-50 text-violet-700 dark:bg-dark-card dark:text-violet-300" />
      )}
      {result.filenames.length > 0 && (
        <Block title="Filename ideas" text={result.filenames} mono />
      )}
      <Block title="SEO keyword ideas" text={result.seoKeywords} />
      <p className="text-xs text-slate-400 text-center pt-2">
        Generated using rule-based templates for {platform}. Swap in an AI provider later for richer output.
      </p>
    </div>
  );
}

function useGeneratorState(): [GeneratorInput, (i: GeneratorInput) => void] {
  const [input, setInput] = useState<GeneratorInput>({
    topic: '', category: '', language: 'english', tone: 'casual', keywords: [],
  });
  return [input, setInput];
}

/* ---------- YouTube Content Generator ---------- */
export const YtContentGenerator = makeTool('yt-content-generator', () => {
  const [input, setInput] = useGeneratorState();
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const run = () => setResult(generateYouTube(input));
  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <GeneratorForm input={input} setInput={setInput} onGenerate={run} label="Generate YouTube content" />
        <div className="lg:col-span-2 space-y-4">
          {result ? <GeneratorResults result={result} platform="YouTube" /> : <ToolEmpty label="Fill in the topic and click generate to create 10 titles, a description, 30 tags, 20 hashtags and more." />}
        </div>
      </div>
    </>
  );
});

/* ---------- TikTok Content Generator ---------- */
export const TiktokContentGenerator = makeTool('tiktok-content-generator', () => {
  const [input, setInput] = useGeneratorState();
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const run = () => setResult(generateTikTok(input));
  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <GeneratorForm input={input} setInput={setInput} onGenerate={run} label="Generate TikTok content" />
        <div className="lg:col-span-2 space-y-4">
          {result ? <GeneratorResults result={result} platform="TikTok" /> : <ToolEmpty label="Generate captions, 20 hashtags and hooks for your TikTok." />}
        </div>
      </div>
    </>
  );
});

/* ---------- Instagram Content Generator ---------- */
export const IgContentGenerator = makeTool('ig-content-generator', () => {
  const [input, setInput] = useGeneratorState();
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const run = () => setResult(generateInstagram(input));
  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <GeneratorForm input={input} setInput={setInput} onGenerate={run} label="Generate Instagram content" />
        <div className="lg:col-span-2 space-y-4">
          {result ? <GeneratorResults result={result} platform="Instagram" /> : <ToolEmpty label="Generate captions and up to 30 hashtags for your Instagram post." />}
        </div>
      </div>
    </>
  );
});

/* ---------- Facebook Content Generator ---------- */
export const FbContentGenerator = makeTool('fb-content-generator', () => {
  const [input, setInput] = useGeneratorState();
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const run = () => setResult(generateFacebook(input));
  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <GeneratorForm input={input} setInput={setInput} onGenerate={run} label="Generate Facebook content" />
        <div className="lg:col-span-2 space-y-4">
          {result ? <GeneratorResults result={result} platform="Facebook" /> : <ToolEmpty label="Generate post text, headlines and hashtags for Facebook." />}
        </div>
      </div>
    </>
  );
});

/* ---------- Twitter Content Generator ---------- */
export const TwContentGenerator = makeTool('tw-content-generator', () => {
  const [input, setInput] = useGeneratorState();
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const run = () => setResult(generateTwitter(input));
  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <GeneratorForm input={input} setInput={setInput} onGenerate={run} label="Generate Twitter content" />
        <div className="lg:col-span-2 space-y-4">
          {result ? <GeneratorResults result={result} platform="Twitter/X" /> : <ToolEmpty label="Generate tweets, a ready-to-post thread, and hashtags." />}
        </div>
      </div>
    </>
  );
});

// Dispatcher for lazy loading by name.
import type { ComponentType } from 'react';
const SOCIAL_COMPONENTS: Record<string, ComponentType<{ onSignIn: () => void }>> = {
  YtThumbnailDownloader, YtThumbnailPreview, YtThumbnailSize, YtTagCounter,
  YtTitleCounter, YtDescriptionCounter, YtTimestamps, YtContentGenerator,
  TiktokCaptionChecker, TiktokHashtagCounter, TiktokUsernameChecker, TiktokBioCounter, TiktokContentGenerator,
  IgGridPreview, IgBioCounter, IgHashtagCounter, IgContentGenerator,
  FbContentGenerator, TwContentGenerator,
};
export default function SocialDispatcher({ name, onSignIn }: { name: string; onSignIn: () => void }) {
  const C = SOCIAL_COMPONENTS[name];
  return C ? <C onSignIn={onSignIn} /> : null;
}

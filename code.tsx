import { useState, useEffect, useRef, useCallback } from 'react';
import { Editor, type OnMount } from '@monaco-editor/react';
import {
  Play, RotateCcw, Download, Upload, Maximize2, Minimize2, Monitor, Tablet, Smartphone,
  Code2, FileCode, Settings, Trash2, Copy, Check,
} from 'lucide-react';
import { ToolShell, ToolLocked } from '../components/ToolShell';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

type FileType = 'html' | 'css' | 'js';

type EditorSettings = {
  fontSize: number;
  fontFamily: string;
  theme: 'vs-dark' | 'light';
  tabSize: number;
  wordWrap: boolean;
  lineHeight: number;
  cursorStyle: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
};

const DEFAULTS = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="card">
    <h1>Hello from Allin1</h1>
    <p>Edit the HTML, CSS and JS tabs and hit Run.</p>
    <button id="btn">Click me</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
  css: `* { box-sizing: border-box; margin: 0; }
body {
  font-family: system-ui, sans-serif;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: #fff;
}
.card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 2.5rem;
  border-radius: 1.5rem;
  text-align: center;
}
h1 { margin-bottom: 0.5rem; }
p { opacity: 0.8; margin-bottom: 1.5rem; }
button {
  background: #fff;
  color: #2563eb;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s;
}
button:active { transform: scale(0.96); }`,
  js: `document.getElementById('btn').addEventListener('click', () => {
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const c = colors[Math.floor(Math.random() * colors.length)];
  document.body.style.background = \`linear-gradient(135deg, \${c}, #10b981)\`;
});`,
};

const STORAGE_KEY = 'allin1-code-compiler';
const SETTINGS_KEY = 'allin1-code-settings';

function loadState(): { html: string; css: string; js: string } {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return s ?? DEFAULTS;
  } catch { return DEFAULTS; }
}

function loadSettings(): EditorSettings {
  try {
    return {
      fontSize: 14,
      fontFamily: '"JetBrains Mono", monospace',
      theme: 'vs-dark',
      tabSize: 2,
      wordWrap: true,
      lineHeight: 20,
      cursorStyle: 'line',
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'),
    };
  } catch {
    return { fontSize: 14, fontFamily: '"JetBrains Mono", monospace', theme: 'vs-dark', tabSize: 2, wordWrap: true, lineHeight: 20, cursorStyle: 'line' };
  }
}

type ViewMode = 'full' | 'desktop' | 'tablet' | 'mobile';
const VIEW_W: Record<ViewMode, number | null> = { full: null, desktop: 1280, tablet: 768, mobile: 375 };

export function CodeCompiler({ onSignIn }: { onSignIn: () => void }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [files, setFiles] = useState(loadState);
  const [active, setActive] = useState<FileType>('html');
  const [settings, setSettings] = useState(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState<ViewMode>('full');
  const [fullscreen, setFullscreen] = useState(false);
  const [srcDoc, setSrcDoc] = useState('');
  const [autoRun, setAutoRun] = useState(true);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const settingsTimer = useRef<number | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(files)); }, [files]);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);

  // Sync editor theme with app theme if user hasn't explicitly set it
  useEffect(() => {
    setSettings((s) => ({ ...s, theme: theme === 'dark' ? 'vs-dark' : 'light' }));
  }, [theme]);

  const buildDoc = useCallback(() => {
    const html = files.html
      .replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/g, '')
      .replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/g, '');
    return `${html}<style>${files.css}</style><script>${files.js}<\/script>`;
  }, [files]);

  const run = useCallback(() => setSrcDoc(buildDoc()), [buildDoc]);

  useEffect(() => {
    if (autoRun) {
      const t = setTimeout(() => setSrcDoc(buildDoc()), 500);
      return () => clearTimeout(t);
    }
  }, [files, autoRun, buildDoc]);

  const reset = () => {
    setFiles(DEFAULTS);
    toast('Reset to starter template', 'info');
  };

  const downloadProject = () => {
    const out = `<!DOCTYPE html>\n<!-- Generated by Allin1 Code Compiler -->\n${files.html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/g, '').replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/g, '')}<style>\n${files.css}\n</style>\n<script>\n${files.js}\n<\/script>\n`;
    const blob = new Blob([out], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'allin1-project.html';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Project downloaded', 'success');
  };

  const importProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const cssMatch = text.match(/<style>([\s\S]*?)<\/style>/i);
      const jsMatch = text.match(/<script>([\s\S]*?)<\/script>/i);
      const cleanHtml = text
        .replace(/<style>[\s\S]*?<\/style>/gi, '')
        .replace(/<script>[\s\S]*?<\/script>/gi, '')
        .replace(/<!--[^>]*-->/g, '');
      setFiles({
        html: cleanHtml.trim() || DEFAULTS.html,
        css: cssMatch?.[1]?.trim() ?? '',
        js: jsMatch?.[1]?.trim() ?? '',
      });
      toast('Project imported', 'success');
    };
    reader.readAsText(file);
  };

  const copyAll = () => {
    const out = buildDoc();
    navigator.clipboard.writeText(out);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast('Code copied', 'success');
  };

  const onMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
  };

  if (!user) return <ToolLocked onSignIn={onSignIn} />;

  const tabs: { id: FileType; label: string; icon: typeof Code2 }[] = [
    { id: 'html', label: 'index.html', icon: FileCode },
    { id: 'css', label: 'style.css', icon: Code2 },
    { id: 'js', label: 'script.js', icon: Code2 },
  ];

  const langMap: Record<FileType, string> = { html: 'html', css: 'css', js: 'javascript' };
  const viewW = VIEW_W[view];

  return (
    <ToolShell toolId="code-compiler">
      <div className={fullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-dark-bg p-4 overflow-auto' : ''}>
        {fullscreen && (
          <button onClick={() => setFullscreen(false)} className="btn-ghost mb-3">
            <Minimize2 size={16} /> Exit fullscreen
          </button>
        )}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Editor pane */}
          <div className={`card overflow-hidden flex flex-col ${fullscreen ? 'h-[80vh]' : 'h-[600px]'}`}>
            <div className="flex items-center justify-between border-b border-line dark:border-dark-border bg-slate-50 dark:bg-dark-card px-2">
              <div className="flex">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActive(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono border-b-2 transition ${
                        active === t.id
                          ? 'border-brand-500 text-brand-600 bg-white dark:bg-dark-surface'
                          : 'border-transparent text-slate-500 hover:text-ink dark:hover:text-dark-text'
                      }`}
                    >
                      <Icon size={13} /> {t.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowSettings((s) => !s)} className="btn-ghost !px-2" title="Editor settings"><Settings size={15} /></button>
                <button onClick={run} className="btn-primary !py-1.5 !px-3 text-xs"><Play size={13} /> Run</button>
              </div>
            </div>

            {showSettings && (
              <div className="border-b border-line dark:border-dark-border bg-slate-50 dark:bg-dark-card p-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="label text-xs">Font size</label>
                  <input type="number" min={10} max={24} value={settings.fontSize} onChange={(e) => setSettings({ ...settings, fontSize: +e.target.value })} className="input !py-1.5" />
                </div>
                <div>
                  <label className="label text-xs">Tab size</label>
                  <input type="number" min={1} max={8} value={settings.tabSize} onChange={(e) => setSettings({ ...settings, tabSize: +e.target.value })} className="input !py-1.5" />
                </div>
                <div>
                  <label className="label text-xs">Line height</label>
                  <input type="number" min={14} max={32} value={settings.lineHeight} onChange={(e) => setSettings({ ...settings, lineHeight: +e.target.value })} className="input !py-1.5" />
                </div>
                <div>
                  <label className="label text-xs">Cursor style</label>
                  <select value={settings.cursorStyle} onChange={(e) => setSettings({ ...settings, cursorStyle: e.target.value as EditorSettings['cursorStyle'] })} className="input !py-1.5">
                    <option value="line">Line</option>
                    <option value="block">Block</option>
                    <option value="underline">Underline</option>
                    <option value="line-thin">Line thin</option>
                    <option value="block-outline">Block outline</option>
                    <option value="underline-thin">Underline thin</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-slate-600 dark:text-dark-muted">
                  <input type="checkbox" checked={settings.wordWrap} onChange={(e) => setSettings({ ...settings, wordWrap: e.target.checked })} /> Word wrap
                </label>
              </div>
            )}

            <div className="flex-1 min-h-0">
              <Editor
                language={langMap[active]}
                value={files[active]}
                theme={settings.theme}
                onMount={onMount}
                onChange={(v) => setFiles((f) => ({ ...f, [active]: v ?? '' }))}
                options={{
                  fontSize: settings.fontSize,
                  fontFamily: settings.fontFamily,
                  tabSize: settings.tabSize,
                  wordWrap: settings.wordWrap ? 'on' : 'off',
                  lineHeight: settings.lineHeight,
                  cursorStyle: settings.cursorStyle,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                  smoothScrolling: true,
                  renderLineHighlight: 'all',
                  bracketPairColorization: { enabled: true },
                }}
              />
            </div>
          </div>

          {/* Preview pane */}
          <div className={`card overflow-hidden flex flex-col ${fullscreen ? 'h-[80vh]' : 'h-[600px]'}`}>
            <div className="flex items-center justify-between border-b border-line dark:border-dark-border bg-slate-50 dark:bg-dark-card px-3 py-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-dark-muted">Preview</span>
              <div className="flex items-center gap-1">
                {([['full', Monitor], ['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([mode, Icon]) => (
                  <button key={mode} onClick={() => setView(mode)} className={`btn-ghost !px-2 !py-1.5 ${view === mode ? 'text-brand-600 bg-brand-50 dark:bg-dark-card' : ''}`} title={mode}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-slate-200 dark:bg-black/40 grid place-items-center overflow-auto p-2">
              <iframe
                ref={iframeRef}
                srcDoc={srcDoc}
                title="preview"
                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                className="bg-white border-0 transition-all"
                style={{ width: viewW ? `${viewW}px` : '100%', height: '100%', maxWidth: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-dark-muted cursor-pointer">
            <input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} /> Auto-run
          </label>
          <span className="flex-1" />
          <button onClick={copyAll} className="btn-secondary text-xs">{copied ? <Check size={14} /> : <Copy size={14} />} Copy</button>
          <label className="btn-secondary text-xs cursor-pointer">
            <Upload size={14} /> Import
            <input type="file" accept=".html,.htm" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importProject(f); }} />
          </label>
          <button onClick={downloadProject} className="btn-secondary text-xs"><Download size={14} /> Export</button>
          <button onClick={reset} className="btn-secondary text-xs"><RotateCcw size={14} /> Reset</button>
          <button onClick={() => setFullscreen((f) => !f)} className="btn-secondary text-xs">{fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} Fullscreen</button>
        </div>

        <p className="mt-4 text-xs text-slate-400 dark:text-dark-muted">
          Tip: press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-card border border-line dark:border-dark-border font-mono text-[10px]">Ctrl/Cmd + Enter</kbd> to run. Your work auto-saves to this browser.
        </p>
      </div>
    </ToolShell>
  );
}

export default CodeCompiler;

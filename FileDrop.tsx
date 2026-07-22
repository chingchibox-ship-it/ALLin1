import { useRef, useState } from 'react';
import { UploadCloud, X, FileIcon } from 'lucide-react';
import { formatBytes } from '../lib/files';

type Props = {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  files?: File[];
  onRemove?: (index: number) => void;
  hint?: string;
};

export function FileDrop({ accept, multiple, onFiles, files = [], onRemove, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handle = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-2xl border-2 border-dashed transition px-5 py-8 text-center ${
          drag ? 'border-brand-400 bg-brand-50' : 'border-line bg-slate-50 hover:border-brand-300 hover:bg-brand-50/40'
        }`}
      >
        <UploadCloud size={28} className="mx-auto text-brand-500 mb-2" />
        <p className="text-sm font-medium text-ink">
          Drop {multiple ? 'files' : 'a file'} here or <span className="text-brand-600">browse</span>
        </p>
        {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handle(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-white border border-line px-3 py-2">
              <FileIcon size={16} className="text-brand-500 shrink-0" />
              <span className="text-sm text-ink truncate flex-1">{f.name}</span>
              <span className="text-xs text-slate-400 shrink-0">{formatBytes(f.size)}</span>
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(i);
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  aria-label="Remove"
                >
                  <X size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronRight, Lock, Loader2, Heart } from 'lucide-react';
import { useRouter } from '../lib/router';
import { CATEGORY_MAP, TOOL_MAP } from '../lib/registry';
import { useAuth } from '../auth/AuthContext';
import { useToolUsage } from '../lib/useToolUsage';
import { useFavorites, recordHistory } from '../lib/useFavorites';
import { useToast } from '../context/ToastContext';

export function ToolShell({
  toolId,
  children,
}: {
  toolId: string;
  children?: ReactNode;
}) {
  const tool = TOOL_MAP[toolId];
  const cat = tool ? CATEGORY_MAP[tool.category] : null;
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { recordUsage } = useToolUsage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    if (user && tool && !recorded) {
      recordUsage(tool.id, tool.name, tool.category);
      recordHistory(tool.id, tool.name);
      setRecorded(true);
    }
    if (!user) setRecorded(false);
  }, [user, tool, recorded, recordUsage]);

  if (!tool || !cat) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink">Tool not found</h1>
        <button onClick={() => navigate({ name: 'home' })} className="btn-primary mt-4">Go home</button>
      </div>
    );
  }

  const Icon = cat.icon;
  const fav = isFavorite(tool.id);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-dark-muted mb-4">
        <button onClick={() => navigate({ name: 'home' })} className="hover:text-brand-600">Home</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate({ name: 'category', categoryId: cat.id })} className="hover:text-brand-600">
          {cat.name}
        </button>
        <ChevronRight size={12} />
        <span className="text-ink dark:text-dark-text font-medium">{tool.name}</span>
      </nav>

      <div className="flex items-start gap-4 mb-6">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} grid place-items-center text-white shadow-sm shrink-0`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-ink dark:text-dark-text tracking-tight">{tool.name}</h1>
          <p className="text-slate-500 dark:text-dark-muted mt-1">{tool.description}</p>
        </div>
        <button
          onClick={() => {
            toggleFavorite(tool.id, tool.name, tool.category);
            toast(fav ? 'Removed from favorites' : 'Added to favorites', fav ? 'info' : 'success');
          }}
          className={`btn-ghost !px-2.5 shrink-0 ${fav ? 'text-rose-500' : ''}`}
          aria-label="Toggle favorite"
          title={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} className={fav ? 'fill-rose-500' : ''} />
        </button>
      </div>

      {children}

      <p className="mt-6 text-xs text-slate-400 dark:text-dark-muted flex items-center gap-1.5">
        <Lock size={12} /> Everything runs in your browser. Your files never leave your device.
      </p>
    </div>
  );
}

export function ToolLocked({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 dark:bg-dark-card border border-brand-100 dark:border-dark-border text-brand-600 mb-4">
        <Lock size={24} />
      </div>
      <h1 className="text-xl font-bold text-ink dark:text-dark-text">Sign in to use this tool</h1>
      <p className="text-sm text-slate-500 dark:text-dark-muted mt-2 mb-5">
        Allin1 tools are free for everyone. Sign in once to unlock all 90+ tools and keep your history.
      </p>
      <button onClick={onSignIn} className="btn-primary">
        Sign in / Sign up
      </button>
    </div>
  );
}

export function ToolLoading({ label = 'Working…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-slate-400 dark:text-dark-muted">
      <Loader2 size={20} className="animate-spin mr-2" /> {label}
    </div>
  );
}

export function ToolEmpty({ label = 'Nothing yet — enter your input to see results.' }: { label?: string }) {
  return (
    <div className="py-12 text-center text-sm text-slate-400 dark:text-dark-muted">{label}</div>
  );
}

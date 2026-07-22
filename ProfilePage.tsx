import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToolUsage } from '../lib/useToolUsage';
import { useFavorites, useToolHistory } from '../lib/useFavorites';
import { useTheme } from '../context/ThemeContext';
import { TOOL_MAP, CATEGORY_MAP } from '../lib/registry';
import { useRouter } from '../lib/router';
import { Mail, Calendar, Clock, TrendingUp, LogOut, Hash, Heart, History, Sun, Moon, Trash2, ArrowRight } from 'lucide-react';

export function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const { navigate } = useRouter();
  const { getRecentlyUsed, getMostUsed } = useToolUsage();
  const { favorites, removeFavorite } = useFavorites();
  const { history } = useToolHistory();
  const { theme, toggle } = useTheme();
  const [recent, setRecent] = useState<string[]>([]);
  const [most, setMost] = useState<{ tool_id: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState<'favorites' | 'history' | 'stats'>('favorites');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [r, m] = await Promise.all([getRecentlyUsed(50), getMostUsed(50)]);
      setRecent(r.map((x) => x.tool_id));
      setMost(m.map((x) => ({ tool_id: x.tool_id, count: x.count })));
      setTotal(m.reduce((s, x) => s + x.count, 0));
    })();
  }, [user, getRecentlyUsed, getMostUsed]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink dark:text-dark-text">Sign in to view your dashboard</h1>
        <button onClick={() => navigate({ name: 'home' })} className="btn-primary mt-4">Go home</button>
      </div>
    );
  }

  const initials = (profile?.full_name || user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="card p-6 flex items-center gap-4 flex-wrap">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-white grid place-items-center text-2xl font-bold">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-ink dark:text-dark-text truncate">{profile?.full_name || 'User'}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-dark-muted flex-wrap">
            <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
            {profile?.created_at && (
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {new Date(profile.created_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <button onClick={toggle} className="btn-ghost" title="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={signOut} className="btn-secondary">
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total tool uses" value={total} icon={<Hash size={16} />} />
        <StatCard label="Distinct tools" value={new Set(recent).size} icon={<TrendingUp size={16} />} />
        <StatCard label="Favorites" value={favorites.length} icon={<Heart size={16} />} />
        <StatCard label="History items" value={history.length} icon={<Clock size={16} />} />
      </div>

      <div className="flex gap-1 mt-6 border-b border-line dark:border-dark-border">
        {([['favorites', 'Favorites', Heart], ['history', 'History', History], ['stats', 'Stats', TrendingUp]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === id ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-ink dark:hover:text-dark-text'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'favorites' && (
          <div className="card p-5">
            {favorites.length === 0 ? (
              <EmptyState label="No favorites yet" hint="Tap the heart icon on any tool to save it here." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {favorites.map((f) => {
                  const cat = CATEGORY_MAP[f.category as keyof typeof CATEGORY_MAP];
                  return (
                    <div key={f.toolId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-line dark:border-dark-border hover:border-brand-300 transition group">
                      {cat && <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.color} grid place-items-center text-white shrink-0`}><cat.icon size={16} /></div>}
                      <button onClick={() => navigate({ name: 'tool', toolId: f.toolId })} className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium text-ink dark:text-dark-text truncate">{f.toolName}</div>
                        <div className="text-xs text-slate-400">{cat?.shortName}</div>
                      </button>
                      <button onClick={() => removeFavorite(f.toolId)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition p-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="card p-5">
            {history.length === 0 ? (
              <EmptyState label="No history yet" hint="Tools you use will appear here, most recent first." />
            ) : (
              <ul className="divide-y divide-line dark:divide-dark-border">
                {history.slice(0, 40).map((h) => (
                  <li key={`${h.toolId}-${h.ts}`}>
                    <button onClick={() => navigate({ name: 'tool', toolId: h.toolId })} className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-dark-card rounded-lg px-2 -mx-2 transition">
                      <History size={15} className="text-slate-400 shrink-0" />
                      <span className="text-sm font-medium text-ink dark:text-dark-text flex-1 truncate">{h.toolName}</span>
                      <span className="text-xs text-slate-400">{new Date(h.ts).toLocaleDateString()} · {new Date(h.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <ArrowRight size={14} className="text-slate-300" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h2 className="font-semibold text-ink dark:text-dark-text mb-3 flex items-center gap-2"><Clock size={16} className="text-brand-600" /> Recently used</h2>
              {recent.length === 0 ? <p className="text-sm text-slate-400">No activity yet.</p> : (
                <ul className="space-y-1">
                  {Array.from(new Set(recent)).slice(0, 10).map((id) => {
                    const t = TOOL_MAP[id];
                    if (!t) return null;
                    return (
                      <li key={id}>
                        <button onClick={() => navigate({ name: 'tool', toolId: id })} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-card text-sm transition">
                          <span className="text-ink dark:text-dark-text font-medium">{t.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="card p-5">
              <h2 className="font-semibold text-ink dark:text-dark-text mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-accent-600" /> Most used</h2>
              {most.length === 0 ? <p className="text-sm text-slate-400">No activity yet.</p> : (
                <ul className="space-y-1">
                  {most.slice(0, 10).map((m) => {
                    const t = TOOL_MAP[m.tool_id];
                    if (!t) return null;
                    return (
                      <li key={m.tool_id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-card text-sm transition">
                        <button onClick={() => navigate({ name: 'tool', toolId: m.tool_id })} className="text-ink dark:text-dark-text font-medium">{t.name}</button>
                        <span className="chip bg-brand-50 text-brand-700 dark:bg-dark-card dark:text-brand-300">{m.count}×</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-dark-muted">{icon} {label}</div>
      <div className="text-2xl font-bold text-ink dark:text-dark-text mt-1">{value}</div>
    </div>
  );
}

function EmptyState({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm font-medium text-slate-500 dark:text-dark-muted">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{hint}</p>
    </div>
  );
}

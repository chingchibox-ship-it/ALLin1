import { useEffect, useRef, useState } from 'react';
import { Search, LogIn, Menu, X, LogOut, User as UserIcon, ChevronDown, Moon, Sun, Heart } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { searchTools, type Tool } from '../lib/registry';
import { useRouter, toHash } from '../lib/router';

export function Header({ onOpenAuth }: { onOpenAuth: (mode: 'signin' | 'signup') => void }) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { navigate, route } = useRouter();
  const [favCount, setFavCount] = useState(0);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setShowResults(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setQ(route.name === 'search' ? route.query : '');
  }, [route]);

  useEffect(() => {
    const update = () => setFavCount(JSON.parse(localStorage.getItem('allin1-favorites') || '[]').length);
    update();
    window.addEventListener('allin1-favorites-changed', update);
    return () => window.removeEventListener('allin1-favorites-changed', update);
  }, []);

  const onChange = (val: string) => {
    setQ(val);
    setResults(searchTools(val).slice(0, 8));
    setShowResults(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate({ name: 'search', query: q.trim() });
      setShowResults(false);
    }
  };

  const pickResult = (t: Tool) => {
    navigate({ name: 'tool', toolId: t.id });
    setQ('');
    setShowResults(false);
  };

  const goHome = () => navigate({ name: 'home' });

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-line dark:border-dark-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-16">
          <button onClick={goHome} className="flex items-center gap-2 shrink-0 group">
            <img src="/image.png" alt="Allin1" className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:shadow-glow transition-shadow" />
            <span className="font-extrabold text-lg tracking-tight text-ink hidden sm:block">
              Allin<span className="text-brand-600">1</span>
            </span>
          </button>

          <div ref={boxRef} className="relative flex-1 max-w-xl mx-auto hidden md:block">
            <form onSubmit={onSubmit}>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => onChange(e.target.value)}
                  onFocus={() => results.length && setShowResults(true)}
                  placeholder="Search 60+ tools…"
                  className="input pl-10 !bg-slate-50 !border-transparent focus:!bg-white focus:!border-brand-300"
                />
              </div>
            </form>
            {showResults && results.length > 0 && (
              <div className="absolute top-full mt-2 w-full card overflow-hidden animate-slide-up z-50">
                {results.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => pickResult(t)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{t.name}</div>
                      <div className="text-xs text-slate-500 truncate">{t.description}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 shrink-0">{t.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => window.location.hash = toHash({ name: 'profile' })}
              className="btn-ghost !px-2 relative"
              aria-label="Favorites"
              title="Your favorites & dashboard"
            >
              <Heart size={18} />
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 grid place-items-center">
                  {favCount}
                </span>
              )}
            </button>
            <button
              onClick={toggle}
              className="btn-ghost !px-2"
              aria-label="Toggle dark mode"
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl pl-1.5 pr-2 py-1.5 hover:bg-slate-100 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white grid place-items-center text-xs font-bold">
                    {(profile?.full_name || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 card p-2 animate-slide-up z-50">
                    <div className="px-3 py-2 border-b border-line mb-1">
                      <div className="text-sm font-semibold text-ink truncate">{profile?.full_name || 'User'}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        window.location.hash = toHash({ name: 'profile' });
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2"
                    >
                      <UserIcon size={16} /> Profile & history
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-sm text-rose-600 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => onOpenAuth('signin')} className="btn-secondary hidden sm:inline-flex">
                <LogIn size={16} /> Sign in
              </button>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="btn-ghost md:hidden !px-2"
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={onSubmit}>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search tools…"
                className="input pl-10 !bg-slate-50"
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}

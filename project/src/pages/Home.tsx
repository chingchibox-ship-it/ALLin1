import { useEffect, useState } from 'react';
import { ArrowRight, Flame, Star, Clock, TrendingUp, Zap, ShieldCheck, Sparkles, Search } from 'lucide-react';
import { CATEGORIES, TOOLS, TOOL_MAP, featuredTools, toolsByCategory, type Tool } from '../lib/registry';
import { useRouter } from '../lib/router';
import { useAuth } from '../auth/AuthContext';
import { useToolUsage } from '../lib/useToolUsage';

export function Home({ onOpenAuth }: { onOpenAuth: (m: 'signin' | 'signup') => void }) {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { getRecentlyUsed, getMostUsed } = useToolUsage();
  const [recent, setRecent] = useState<Tool[]>([]);
  const [trending, setTrending] = useState<Tool[]>([]);
  const [mostUsed, setMostUsed] = useState<{ tool: Tool; count: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [r, m] = await Promise.all([getRecentlyUsed(8), getMostUsed(8)]);
      setRecent(r.map((x) => TOOL_MAP[x.tool_id]).filter(Boolean));
      setMostUsed(m.map((x) => ({ tool: TOOL_MAP[x.tool_id], count: x.count })).filter((x) => x.tool));
    })();
  }, [user, getRecentlyUsed, getMostUsed]);

  useEffect(() => {
    setTrending(TOOLS.filter((t) => t.badge === 'trending'));
  }, []);

  const featured = featuredTools();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-canvas bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 dark:via-dark-bg/40 dark:to-dark-bg pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-dark-surface border border-line dark:border-dark-border px-3 py-1 text-xs font-medium text-slate-600 dark:text-dark-muted shadow-card mb-5 animate-slide-up">
            <Sparkles size={13} className="text-brand-600" /> 90+ free tools, no installs, fully private
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink animate-slide-up">
            Every tool you need, <br className="hidden sm:block" />
            in <span className="text-gradient">one place</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 dark:text-dark-muted max-w-2xl mx-auto animate-slide-up">
            Image, PDF, text, developer, and everyday utility tools — all free, all in your browser.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3 animate-slide-up">
            <button onClick={() => navigate({ name: 'category', categoryId: 'image' })} className="btn-primary !px-5 !py-3">
              Explore tools <ArrowRight size={16} />
            </button>
            {!user && (
              <button onClick={() => onOpenAuth('signup')} className="btn-secondary !px-5 !py-3">
                Create free account
              </button>
            )}
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-accent-500" /> Private by design</span>
            <span className="flex items-center gap-1.5"><Zap size={14} className="text-brand-600" /> Runs in browser</span>
            <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-500 fill-amber-500" /> Always free</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            const count = toolsByCategory(c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => navigate({ name: 'category', categoryId: c.id })}
                style={{ animationDelay: `${i * 30}ms` }}
                className="group card p-5 text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center text-white shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink dark:text-dark-text">{c.name}</h3>
                  {c.tags.includes('Popular') && (
                    <Flame size={12} className="text-orange-500 fill-orange-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 line-clamp-2">{c.description}</p>
                <div className="mt-3 text-[11px] text-slate-400 font-medium">{count} tools</div>
              </button>
            );
          })}
        </div>

        {/* Featured */}
        <Section
          icon={<Star size={16} className="text-amber-500 fill-amber-500" />}
          title="Featured tools"
          subtitle="Start here — our most-loved tools."
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((t) => (
              <FeaturedCard key={t.id} tool={t} onClick={() => navigate({ name: 'tool', toolId: t.id })} />
            ))}
          </div>
        </Section>

        {/* Recently Used (signed-in) */}
        {user && recent.length > 0 && (
          <Section
            icon={<Clock size={16} className="text-brand-600" />}
            title="Recently used"
            subtitle="Pick up where you left off."
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recent.map((t) => (
                <FeaturedCard key={t.id} tool={t} onClick={() => navigate({ name: 'tool', toolId: t.id })} />
              ))}
            </div>
          </Section>
        )}

        {/* Most used (signed-in) */}
        {user && mostUsed.length > 0 && (
          <Section
            icon={<TrendingUp size={16} className="text-accent-600" />}
            title="Most used by you"
            subtitle="Your most-reached-for tools."
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mostUsed.slice(0, 8).map(({ tool, count }) => (
                <FeaturedCard
                  key={tool.id}
                  tool={tool}
                  badge={`${count}× used`}
                  onClick={() => navigate({ name: 'tool', toolId: tool.id })}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Trending (global) */}
        <Section
          icon={<TrendingUp size={16} className="text-rose-500" />}
          title="Trending"
          subtitle="What other people are trying right now."
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trending.slice(0, 8).map((t) => (
              <FeaturedCard key={t.id} tool={t} onClick={() => navigate({ name: 'tool', toolId: t.id })} />
            ))}
          </div>
        </Section>

        {/* CTA */}
        {!user && (
          <div className="mt-12 card p-8 sm:p-10 bg-gradient-to-br from-brand-600 to-brand-700 border-0 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative">
              <Search size={28} className="mx-auto mb-3" />
              <h2 className="text-2xl font-bold">Unlock every tool, free</h2>
              <p className="text-brand-100 mt-2 max-w-lg mx-auto">
                Sign up to keep your tool history, get personalized recommendations and access everything in one place.
              </p>
              <button
                onClick={() => onOpenAuth('signup')}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 font-semibold px-5 py-3 hover:bg-brand-50 transition shadow-glow"
              >
                Get started — it's free <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Why choose Allin1 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-ink dark:text-dark-text text-center">Why choose Allin1</h2>
          <p className="text-slate-500 dark:text-dark-muted text-center mt-2">Everything you need, nothing you don't.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { icon: ShieldCheck, title: 'Private by design', desc: 'Files never leave your device — all processing happens in your browser.' },
              { icon: Zap, title: 'Instant & free', desc: 'No installs, no sign-up walls. Tools load fast and run immediately.' },
              { icon: Sparkles, title: '90+ tools in one place', desc: 'Image, PDF, social, developer, calculators and more — all under one roof.' },
              { icon: Star, title: 'Built for everyone', desc: 'From quick everyday tasks to professional developer workflows.' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card p-5 hover:shadow-card-hover transition">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-dark-card grid place-items-center text-brand-600 mb-3">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-semibold text-ink dark:text-dark-text text-sm">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-ink dark:text-dark-text text-center">Frequently asked questions</h2>
          <div className="max-w-2xl mx-auto mt-6 space-y-3">
            {[
              { q: 'Do I need to install anything?', a: 'No. Allin1 runs entirely in your browser. There is nothing to download or install.' },
              { q: 'Are my files safe?', a: 'Yes. All image and PDF processing happens locally in your browser — your files never get uploaded to a server.' },
              { q: 'Is it really free?', a: 'Every tool is free to use. Sign in to keep your history and favorites across devices; the tools themselves are always free.' },
              { q: 'Do I need an account?', a: 'You need a free account to run tools, which lets us keep your history, favorites and personalized recommendations.' },
            ].map((item) => (
              <details key={item.q} className="card p-4 group">
                <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium text-ink dark:text-dark-text">
                  {item.q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="text-sm text-slate-500 dark:text-dark-muted mt-2 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-dark-text flex items-center gap-2">{icon} {title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function FeaturedCard({
  tool,
  onClick,
  badge,
}: {
  tool: Tool;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group card p-4 text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{tool.category}</span>
        {badge && (
          <span className="chip bg-brand-50 text-brand-700">{badge}</span>
        )}
        {tool.badge === 'popular' && !badge && (
          <span className="chip bg-amber-50 text-amber-700"><Star size={10} className="fill-amber-500 text-amber-500" /> Popular</span>
        )}
        {tool.badge === 'new' && !badge && (
          <span className="chip bg-accent-50 text-accent-700">New</span>
        )}
      </div>
      <h3 className="font-semibold text-ink dark:text-dark-text text-sm group-hover:text-brand-600 transition">{tool.name}</h3>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tool.description}</p>
    </button>
  );
}

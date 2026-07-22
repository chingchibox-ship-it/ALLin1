import { CATEGORY_MAP, toolsByCategory } from '../lib/registry';
import { useRouter } from '../lib/router';
import { ArrowRight, Star, Sparkles } from 'lucide-react';

export function CategoryPage({ categoryId }: { categoryId: string }) {
  const { navigate } = useRouter();
  const cat = CATEGORY_MAP[categoryId as keyof typeof CATEGORY_MAP];
  if (!cat) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink">Category not found</h1>
        <button onClick={() => navigate({ name: 'home' })} className="btn-primary mt-4">Go home</button>
      </div>
    );
  }
  const tools = toolsByCategory(cat.id);
  const Icon = cat.icon;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} grid place-items-center text-white shadow-sm`}>
          <Icon size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight">{cat.name}</h1>
          <p className="text-slate-500 mt-1">{cat.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t, i) => (
          <button
            key={t.id}
            onClick={() => navigate({ name: 'tool', toolId: t.id })}
            style={{ animationDelay: `${i * 25}ms` }}
            className="group card p-5 text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all animate-slide-up"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-ink group-hover:text-brand-600 transition">{t.name}</h3>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all mt-1" />
            </div>
            <p className="text-sm text-slate-500">{t.description}</p>
            <div className="mt-3 flex items-center gap-2">
              {t.badge === 'popular' && (
                <span className="chip bg-amber-50 text-amber-700"><Star size={10} className="fill-amber-500 text-amber-500" /> Popular</span>
              )}
              {t.badge === 'new' && (
                <span className="chip bg-accent-50 text-accent-700"><Sparkles size={10} /> New</span>
              )}
              {t.badge === 'trending' && (
                <span className="chip bg-rose-50 text-rose-700">Trending</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

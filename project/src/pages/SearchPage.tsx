import { searchTools, type Tool } from '../lib/registry';
import { useRouter } from '../lib/router';
import { Search, ArrowRight } from 'lucide-react';

export function SearchPage({ query }: { query: string }) {
  const { navigate } = useRouter();
  const results: Tool[] = searchTools(query);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <Search size={16} />
        <span className="text-sm">Search results</span>
      </div>
      <h1 className="text-2xl font-bold text-ink">"{query}"</h1>
      <p className="text-sm text-slate-500 mt-1">{results.length} tool{results.length === 1 ? '' : 's'} found</p>

      {results.length === 0 ? (
        <div className="mt-10 card p-10 text-center">
          <p className="text-slate-500">No tools match your search. Try another keyword.</p>
          <button onClick={() => navigate({ name: 'home' })} className="btn-primary mt-4">Browse all tools</button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate({ name: 'tool', toolId: t.id })}
              className="group card p-4 text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t.category}</div>
                  <h3 className="font-semibold text-ink group-hover:text-brand-600 transition mt-0.5">{t.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{t.description}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

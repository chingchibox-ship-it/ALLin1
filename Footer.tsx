import { Github, Twitter, Heart } from 'lucide-react';
import { CATEGORIES } from '../lib/registry';
import { useRouter } from '../lib/router';

export function Footer() {
  const { navigate } = useRouter();
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 grid place-items-center text-white">
                <span className="font-bold text-xs">A1</span>
              </div>
              <span className="font-extrabold text-base tracking-tight">Allin1</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              Every tool you need, in one place. Free, private, and browser-based.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-slate-400 hover:text-brand-600 transition" aria-label="GitHub"><Github size={18} /></a>
              <a href="#" className="text-slate-400 hover:text-brand-600 transition" aria-label="Twitter"><Twitter size={18} /></a>
            </div>
          </div>

          {CATEGORIES.slice(0, 4).map((c) => (
            <div key={c.id}>
              <h4 className="text-sm font-semibold text-ink mb-3">{c.name}</h4>
              <ul className="space-y-2">
                {toolsForFooter(c.id).map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => navigate({ name: 'tool', toolId: t.id })}
                      className="text-sm text-slate-500 hover:text-brand-600 transition text-left"
                    >
                      {t.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Allin1. All rights reserved.</p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for creators
          </p>
        </div>
      </div>
    </footer>
  );
}

import { TOOLS } from '../lib/registry';
function toolsForFooter(cat: string) {
  return TOOLS.filter((t) => t.category === cat).slice(0, 5);
}

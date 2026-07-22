import { useEffect, useState, useCallback } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'category'; categoryId: string }
  | { name: 'tool'; toolId: string }
  | { name: 'search'; query: string }
  | { name: 'profile' };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  if (!h) return { name: 'home' };
  const parts = h.split('/');
  if (parts[0] === 'category' && parts[1]) return { name: 'category', categoryId: decodeURIComponent(parts[1]) };
  if (parts[0] === 'tool' && parts[1]) return { name: 'tool', toolId: decodeURIComponent(parts[1]) };
  if (parts[0] === 'search' && parts[1]) return { name: 'search', query: decodeURIComponent(parts[1]) };
  if (parts[0] === 'profile') return { name: 'profile' };
  return { name: 'home' };
}

export function toHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'category':
      return `#/category/${encodeURIComponent(route.categoryId)}`;
    case 'tool':
      return `#/tool/${encodeURIComponent(route.toolId)}`;
    case 'search':
      return `#/search/${encodeURIComponent(route.query)}`;
    case 'profile':
      return '#/profile';
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((r: Route) => {
    const hash = toHash(r);
    if (hash === window.location.hash) {
      setRoute(parseHash(hash));
    } else {
      window.location.hash = hash;
    }
  }, []);

  return { route, navigate };
}

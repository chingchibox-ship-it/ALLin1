import { useEffect, useState, useCallback } from 'react';

export type Favorite = {
  toolId: string;
  toolName: string;
  category: string;
  addedAt: number;
};

const KEY = 'allin1-favorites';

function read(): Favorite[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function write(favs: Favorite[]) {
  localStorage.setItem(KEY, JSON.stringify(favs));
  window.dispatchEvent(new CustomEvent('allin1-favorites-changed'));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    setFavorites(read());
    const onUpdate = () => setFavorites(read());
    window.addEventListener('allin1-favorites-changed', onUpdate);
    return () => window.removeEventListener('allin1-favorites-changed', onUpdate);
  }, []);

  const isFavorite = useCallback(
    (toolId: string) => favorites.some((f) => f.toolId === toolId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (toolId: string, toolName: string, category: string) => {
      const favs = read();
      const idx = favs.findIndex((f) => f.toolId === toolId);
      if (idx >= 0) {
        favs.splice(idx, 1);
      } else {
        favs.unshift({ toolId, toolName, category, addedAt: Date.now() });
      }
      write(favs);
    },
    []
  );

  const removeFavorite = useCallback((toolId: string) => {
    const favs = read().filter((f) => f.toolId !== toolId);
    write(favs);
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}

export function useToolHistory() {
  const [history, setHistory] = useState<{ toolId: string; toolName: string; ts: number }[]>([]);

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem('allin1-history') || '[]'));
    } catch { setHistory([]); }
    const onUpdate = () => setHistory(JSON.parse(localStorage.getItem('allin1-history') || '[]'));
    window.addEventListener('allin1-history-changed', onUpdate);
    return () => window.removeEventListener('allin1-history-changed', onUpdate);
  }, []);

  return { history };
}

export function recordHistory(toolId: string, toolName: string) {
  try {
    const list = JSON.parse(localStorage.getItem('allin1-history') || '[]') as { toolId: string; toolName: string; ts: number }[];
    const filtered = list.filter((x) => x.toolId !== toolId);
    filtered.unshift({ toolId, toolName, ts: Date.now() });
    localStorage.setItem('allin1-history', JSON.stringify(filtered.slice(0, 100)));
    window.dispatchEvent(new CustomEvent('allin1-history-changed'));
  } catch { /* ignore */ }
}

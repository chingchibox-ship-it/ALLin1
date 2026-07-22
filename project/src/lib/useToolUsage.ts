import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

export type UsageRecord = {
  tool_id: string;
  tool_name: string;
  category: string;
  used_at: string;
};

export function useToolUsage() {
  const { user } = useAuth();

  const recordUsage = useCallback(
    async (toolId: string, toolName: string, category: string) => {
      if (!user) return;
      const { error } = await supabase.from('tool_usage').insert({
        tool_id: toolId,
        tool_name: toolName,
        category,
      });
      if (error) {
        // eslint-disable-next-line no-console
        console.warn('recordUsage error', error.message);
      }
    },
    [user]
  );

  const getRecentlyUsed = useCallback(async (limit = 8) => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('tool_usage')
      .select('tool_id, tool_name, category, used_at')
      .order('used_at', { ascending: false })
      .limit(limit * 4); // over-fetch then dedupe by tool_id
    if (error || !data) return [];
    const seen = new Set<string>();
    const out: UsageRecord[] = [];
    for (const row of data as UsageRecord[]) {
      if (seen.has(row.tool_id)) continue;
      seen.add(row.tool_id);
      out.push(row);
      if (out.length >= limit) break;
    }
    return out;
  }, [user]);

  const getMostUsed = useCallback(async (limit = 8) => {
    if (!user) return [];
    const { data, error } = await supabase.rpc('top_tools_by_user', { limit_count: limit });
    if (error || !data) return [];
    return data as { tool_id: string; tool_name: string; category: string; count: number }[];
  }, [user]);

  return { recordUsage, getRecentlyUsed, getMostUsed };
}

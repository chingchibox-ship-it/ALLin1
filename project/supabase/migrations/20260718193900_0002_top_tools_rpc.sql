/*
# Add top_tools_by_user RPC

1. New Functions
- `top_tools_by_user(limit_count int default 8)` — returns the most-used tools for the *currently authenticated* user, with usage counts. Security definer so it can aggregate across the user's own rows (still scoped by auth.uid()).

2. Security
- SECURITY DEFINER, search_path pinned to public.
- Filters by auth.uid() so a user only ever sees their own usage.
*/

CREATE OR REPLACE FUNCTION public.top_tools_by_user(limit_count int DEFAULT 8)
RETURNS TABLE (tool_id text, tool_name text, category text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT tu.tool_id, tu.tool_name, tu.category, COUNT(*)::bigint AS count
  FROM public.tool_usage tu
  WHERE tu.user_id = auth.uid()
  GROUP BY tu.tool_id, tu.tool_name, tu.category
  ORDER BY count DESC, MAX(tu.used_at) DESC
  LIMIT GREATEST(limit_count, 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.top_tools_by_user(int) TO authenticated;

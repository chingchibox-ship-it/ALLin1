/*
# Allin1 initial schema

1. New Tables
- `profiles` — public profile data mirrored from auth.users (id uuid PK, email text, full_name text, avatar_url text, created_at timestamptz).
- `tool_usage` — analytics of which signed-in user used which tool and how many times (id bigint PK, user_id uuid, tool_id text, tool_name text, category text, used_at timestamptz).

2. Security
- Enable RLS on both tables.
- `profiles`: each authenticated user can read & update only their own profile row. INSERT uses a default of auth.uid() so the client can create a row by inserting just display fields.
- `tool_usage`: each authenticated user can read & insert only their own usage rows. Default user_id = auth.uid().
- No DELETE policies — users do not delete analytics rows.

3. Notes
- Profile rows are created automatically from a trigger on auth.users so every signed-up user has a profile immediately.
- Email confirmation stays OFF (per Supabase guidance for this app).
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.tool_usage (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id text NOT NULL,
  tool_name text NOT NULL,
  category text NOT NULL,
  used_at timestamptz DEFAULT now()
);

ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tool_usage_select_own" ON public.tool_usage;
CREATE POLICY "tool_usage_select_own"
ON public.tool_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tool_usage_insert_own" ON public.tool_usage;
CREATE POLICY "tool_usage_insert_own"
ON public.tool_usage FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS tool_usage_user_id_idx ON public.tool_usage(user_id);
CREATE INDEX IF NOT EXISTS tool_usage_tool_id_idx ON public.tool_usage(tool_id);

-- Auto-create a profile row when a new auth.users row is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

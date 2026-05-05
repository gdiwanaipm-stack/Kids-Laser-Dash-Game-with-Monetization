
-- Tighten UPDATE policy: cannot change gems or highest_level via direct update
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND gems = (SELECT p.gems FROM public.profiles p WHERE p.user_id = auth.uid())
  AND highest_level = (SELECT p.highest_level FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- Secure RPC for monotonic progress updates
CREATE OR REPLACE FUNCTION public.sync_game_progress(p_gems integer, p_level integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_gems IS NULL OR p_gems < 0 OR p_gems > 1000000 THEN
    RAISE EXCEPTION 'Invalid gems value';
  END IF;
  IF p_level IS NULL OR p_level < 0 OR p_level > 5 THEN
    RAISE EXCEPTION 'Invalid level value';
  END IF;

  UPDATE public.profiles
  SET gems = GREATEST(gems, p_gems),
      highest_level = GREATEST(highest_level, p_level)
  WHERE user_id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_game_progress(integer, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.sync_game_progress(integer, integer) TO authenticated;

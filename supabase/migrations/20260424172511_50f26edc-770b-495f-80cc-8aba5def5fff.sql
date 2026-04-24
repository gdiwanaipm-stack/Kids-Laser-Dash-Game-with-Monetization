-- Tighten profiles INSERT policy to prevent self-granted progression
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND gems = 0
  AND highest_level = 0
);

-- Tighten profiles UPDATE policy: highest_level can only go up, gems must be non-negative
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND gems >= 0
  AND highest_level >= 0
  AND highest_level <= 5
);
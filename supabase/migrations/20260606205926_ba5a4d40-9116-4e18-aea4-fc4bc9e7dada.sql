
-- Track gameplay events to power the funnel
CREATE TABLE public.game_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('level_start','level_complete','death','restart')),
  level integer NOT NULL CHECK (level BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.game_events TO authenticated;
GRANT ALL ON public.game_events TO service_role;

ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert their own events"
  ON public.game_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read their own events"
  ON public.game_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_game_events_level_type ON public.game_events(level, event_type);
CREATE INDEX idx_game_events_user ON public.game_events(user_id);

-- Aggregate RPC: returns per-level counts of distinct players who started/completed/died/restarted,
-- plus the count of players whose highest_level reached each level.
CREATE OR REPLACE FUNCTION public.get_funnel_stats()
RETURNS TABLE (
  level integer,
  reached bigint,
  started bigint,
  completed bigint,
  deaths bigint,
  restarts bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH lvls AS (SELECT generate_series(1,5) AS level)
  SELECT
    l.level,
    (SELECT count(*) FROM public.profiles p WHERE p.highest_level >= l.level)::bigint AS reached,
    (SELECT count(DISTINCT user_id) FROM public.game_events e WHERE e.level = l.level AND e.event_type = 'level_start')::bigint AS started,
    (SELECT count(DISTINCT user_id) FROM public.game_events e WHERE e.level = l.level AND e.event_type = 'level_complete')::bigint AS completed,
    (SELECT count(*) FROM public.game_events e WHERE e.level = l.level AND e.event_type = 'death')::bigint AS deaths,
    (SELECT count(*) FROM public.game_events e WHERE e.level = l.level AND e.event_type = 'restart')::bigint AS restarts
  FROM lvls l
  ORDER BY l.level;
$$;

GRANT EXECUTE ON FUNCTION public.get_funnel_stats() TO authenticated;

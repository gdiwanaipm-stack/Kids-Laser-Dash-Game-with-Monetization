import { supabase } from '@/integrations/supabase/client';

export type GameEventType = 'level_start' | 'level_complete' | 'death' | 'restart';

/**
 * Fire-and-forget gameplay telemetry. Failures are swallowed so they
 * never affect the play experience.
 */
export async function logGameEvent(type: GameEventType, level: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (level < 1 || level > 5) return;
    await supabase.from('game_events').insert({
      user_id: user.id,
      event_type: type,
      level,
    });
  } catch {
    /* ignore */
  }
}

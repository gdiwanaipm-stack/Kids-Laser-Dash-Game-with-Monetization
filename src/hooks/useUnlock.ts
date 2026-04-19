import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getStripeEnvironment } from '@/lib/stripe';

export function useUnlock(product = 'level_3_unlock') {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setUnlocked(false); setLoading(false); return; }
    const env = getStripeEnvironment();
    const { data } = await supabase
      .from('game_unlocks')
      .select('id')
      .eq('user_id', user.id)
      .eq('product', product)
      .eq('environment', env)
      .maybeSingle();
    setUnlocked(!!data);
    setLoading(false);
  }, [user, product]);

  useEffect(() => { refresh(); }, [refresh]);

  return { unlocked, loading, refresh };
}

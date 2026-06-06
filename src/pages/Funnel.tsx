import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface FunnelRow {
  level: number;
  reached: number;
  started: number;
  completed: number;
  deaths: number;
  restarts: number;
}

export default function Funnel() {
  const [rows, setRows] = useState<FunnelRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc('get_funnel_stats');
      if (error) { setError(error.message); return; }
      const normalized: FunnelRow[] = (data ?? []).map((r: {
        level: number; reached: number | string; started: number | string;
        completed: number | string; deaths: number | string; restarts: number | string;
      }) => ({
        level: r.level,
        reached: Number(r.reached),
        started: Number(r.started),
        completed: Number(r.completed),
        deaths: Number(r.deaths),
        restarts: Number(r.restarts),
      }));
      setRows(normalized);
    })();
  }, []);

  const maxReached = rows ? Math.max(1, ...rows.map((r) => r.reached)) : 1;
  const totalPlayers = rows && rows.length > 0 ? rows[0].reached : 0;

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="game-title text-3xl md:text-4xl">Player Funnel</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              How many players reach each level — and where lasers send them back.
            </p>
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
            ← Back
          </Link>
        </header>

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 text-destructive p-4 text-sm">
            Couldn't load funnel: {error}
          </div>
        )}

        {!rows && !error && (
          <div className="text-muted-foreground animate-pulse">Loading funnel…</div>
        )}

        {rows && (
          <>
            <div className="mb-6 rounded-2xl border border-border bg-card p-4 md:p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Players who reached level 1</div>
              <div className="text-3xl font-bold text-foreground mt-1">{totalPlayers}</div>
            </div>

            <div className="space-y-4">
              {rows.map((r, idx) => {
                const prevReached = idx === 0 ? totalPlayers : rows[idx - 1].reached;
                const dropOff = Math.max(0, prevReached - r.reached);
                const widthPct = Math.round((r.reached / maxReached) * 100);
                const completionRate = r.started > 0 ? Math.round((r.completed / r.started) * 100) : 0;
                const deathsPerPlayer = r.started > 0 ? (r.deaths / r.started).toFixed(1) : '0.0';
                return (
                  <div key={r.level} className="rounded-2xl border border-border bg-card p-4 md:p-5">
                    <div className="flex items-baseline justify-between mb-3 gap-3">
                      <div className="flex items-baseline gap-3">
                        <span className="text-lg font-bold text-foreground">Level {r.level}</span>
                        <span className="text-sm text-muted-foreground">
                          {r.reached} reached
                          {idx > 0 && dropOff > 0 && (
                            <span className="ml-2 text-destructive">−{dropOff} dropped</span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {completionRate}% completion
                      </span>
                    </div>

                    {/* Funnel bar */}
                    <div className="h-8 w-full rounded-lg bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>

                    {/* Metric grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                      <Stat label="Started" value={r.started} tone="default" />
                      <Stat label="Completed" value={r.completed} tone="accent" />
                      <Stat
                        label="Laser deaths"
                        value={r.deaths}
                        sub={`${deathsPerPlayer}/player`}
                        tone="destructive"
                      />
                      <Stat label="Restarts" value={r.restarts} tone="default" />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              "Reached" comes from each player's highest saved level. "Started / Completed / Deaths / Restarts" come from gameplay events recorded during play.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub?: string;
  tone: 'default' | 'accent' | 'destructive';
}) {
  const toneClass =
    tone === 'accent'
      ? 'text-accent'
      : tone === 'destructive'
        ? 'text-destructive'
        : 'text-foreground';
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold ${toneClass}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

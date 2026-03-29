'use client'
import { useEffect, useState } from 'react'
import { useParams }    from 'next/navigation'
import { motion }       from 'framer-motion'
import { LiveBadge }    from '@/components/ui/LiveBadge'
import { StatBar }      from '@/components/ui/StatBar'
import { ProbabilityBar } from '@/components/ui/ProbabilityBar'
import { FormStrip }    from '@/components/ui/FormStrip'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Users, BarChart2, MessageSquare, Target } from 'lucide-react'

const TABS = ['Overview', 'Stats', 'Lineups', 'Timeline', 'Predictions'] as const
type Tab = typeof TABS[number]

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData]     = useState<Record<string, unknown> | null>(null)
  const [tab, setTab]       = useState<Tab>('Overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/match?id=${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [id])

  const summary  = data?.summary  as Record<string, unknown> | null | undefined
  const lineups  = data?.lineups  as Record<string, unknown> | null | undefined
  const probs    = data?.probs    as Record<string, unknown> | null | undefined
  const facts    = data?.facts    as Record<string, unknown> | null | undefined

  const event     = summary?.sport_event    as Record<string, unknown> | undefined
  const status    = summary?.sport_event_status as Record<string, unknown> | undefined
  const stats     = summary?.statistics     as Record<string, unknown> | undefined

  const competitors  = (event?.competitors as Array<Record<string, unknown>> | undefined) ?? []
  const homeTeam     = competitors.find(c => c.qualifier === 'home')
  const awayTeam     = competitors.find(c => c.qualifier === 'away')

  const matchStatus  = String(status?.match_status ?? '')
  const isLive       = ['live','inprogress'].includes(matchStatus)
  const homeScore    = status?.home_score as number | undefined
  const awayScore    = status?.away_score as number | undefined

  const statsData    = (stats as Record<string, unknown> | undefined)?.totals as Record<string, unknown> | undefined
  const homeStats    = (statsData?.competitors as Array<Record<string, unknown>> | undefined)?.find(c => c.qualifier === 'home')?.statistics as Record<string, number> | undefined
  const awayStats    = (statsData?.competitors as Array<Record<string, unknown>> | undefined)?.find(c => c.qualifier === 'away')?.statistics as Record<string, number> | undefined

  // Probabilities
  const market     = ((probs as Record<string, unknown> | undefined)?.probabilities as Record<string, unknown> | undefined)
  const markets    = (market?.markets as Array<Record<string, unknown>> | undefined) ?? []
  const matchMkt   = markets.find((m: Record<string, unknown>) => String(m.name) === '3way' || String(m.name) === 'match_winner')
  const outcomes   = (matchMkt?.outcomes as Array<Record<string, unknown>> | undefined) ?? []
  const homeProb   = Number((outcomes.find((o: Record<string, unknown>) => String(o.name) === '1' || String(o.name).toLowerCase().includes('home'))?.probability ?? 0))
  const drawProb   = Number((outcomes.find((o: Record<string, unknown>) => String(o.name) === 'X' || String(o.name).toLowerCase().includes('draw'))?.probability ?? 0))
  const awayProb   = Number((outcomes.find((o: Record<string, unknown>) => String(o.name) === '2' || String(o.name).toLowerCase().includes('away'))?.probability ?? 0))

  const factsList = ((facts as Record<string, unknown> | undefined)?.facts as Array<Record<string, unknown>> | undefined) ?? []
  const lineupList = ((lineups as Record<string, unknown> | undefined)?.lineups as Array<Record<string, unknown>> | undefined) ?? []

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <SkeletonCard rows={3} /><SkeletonCard rows={2} />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8"
      >
        <div className="text-center mb-2">
          <span className="text-xs text-text-muted">
            {String(((event?.sport_event_context as Record<string, unknown> | undefined)?.competition as Record<string, unknown> | undefined)?.name ?? '')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Home */}
          <div className="flex-1 text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-3 flex items-center justify-center text-xl font-bold text-text-secondary">
              {String(homeTeam?.abbreviation ?? '?').slice(0,3)}
            </div>
            <p className="font-semibold text-text-primary text-sm">{String(homeTeam?.name ?? 'Home')}</p>
          </div>

          {/* Score */}
          <div className="text-center">
            {isLive && <div className="mb-2 flex justify-center"><LiveBadge /></div>}
            <div className="flex items-center gap-3">
              <motion.span key={homeScore} animate={{ scale: [1.2, 1] }} className="font-display text-5xl font-bold text-text-primary">
                {homeScore ?? (matchStatus === 'not_started' ? '-' : '0')}
              </motion.span>
              <span className="text-3xl text-text-muted font-light">:</span>
              <motion.span key={awayScore} animate={{ scale: [1.2, 1] }} className="font-display text-5xl font-bold text-text-primary">
                {awayScore ?? (matchStatus === 'not_started' ? '-' : '0')}
              </motion.span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              {matchStatus === 'not_started' ? new Date(String(event?.scheduled ?? '')).toLocaleString() : matchStatus.toUpperCase()}
            </p>
          </div>

          {/* Away */}
          <div className="flex-1 text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-3 flex items-center justify-center text-xl font-bold text-text-secondary">
              {String(awayTeam?.abbreviation ?? '?').slice(0,3)}
            </div>
            <p className="font-semibold text-text-primary text-sm">{String(awayTeam?.name ?? 'Away')}</p>
          </div>
        </div>

        {/* Probability Bar */}
        {(homeProb > 0 || drawProb > 0 || awayProb > 0) && (
          <div className="mt-6">
            <ProbabilityBar home={homeProb} draw={drawProb} away={awayProb} size="lg" showLabels />
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-2xl">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
              tab === t ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {tab === 'Overview' && (
          <div className="space-y-4">
            {factsList.length > 0 && (
              <div className="glass rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2"><MessageSquare size={14} /> Fun Facts</h3>
                {factsList.map((f, i) => (
                  <p key={i} className="text-sm text-text-secondary border-l-2 border-primary/30 pl-3">{String(f.statement ?? '')}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'Stats' && homeStats && awayStats && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2"><BarChart2 size={14} /> Match Statistics</h3>
            <div className="space-y-3">
              {[
                { label: 'Possession %',    hv: homeStats.ball_possession  ?? 0, av: awayStats.ball_possession  ?? 0, fmt: (v: number) => `${v}%` },
                { label: 'Shots Total',     hv: homeStats.shots_total      ?? 0, av: awayStats.shots_total      ?? 0 },
                { label: 'Shots on Target', hv: homeStats.shots_on_target  ?? 0, av: awayStats.shots_on_target  ?? 0 },
                { label: 'Corner Kicks',    hv: homeStats.corner_kicks     ?? 0, av: awayStats.corner_kicks     ?? 0 },
                { label: 'Fouls',           hv: homeStats.fouls            ?? 0, av: awayStats.fouls            ?? 0 },
                { label: 'Yellow Cards',    hv: homeStats.yellow_cards     ?? 0, av: awayStats.yellow_cards     ?? 0 },
              ].map(s => (
                <StatBar key={s.label} label={s.label} homeVal={s.hv} awayVal={s.av} format={s.fmt} />
              ))}
            </div>
          </div>
        )}

        {tab === 'Lineups' && lineupList.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {lineupList.map((comp: Record<string, unknown>) => (
              <div key={String(comp.id ?? '')} className="glass rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Users size={14} />{String(comp.name ?? '')}
                  {comp.formation ? <span className="ml-auto text-xs text-text-muted">{String(comp.formation)}</span> : null}
                </h3>
                <div className="space-y-1.5">
                  {((comp.players as Array<Record<string, unknown>>) ?? []).filter((p: Record<string, unknown>) => p.starter).map((p: Record<string, unknown>) => (
                    <div key={String(p.id ?? '')} className="flex items-center gap-2 text-xs">
                      <span className="w-5 text-center text-text-muted font-mono">{String(p.jersey_number ?? '')}</span>
                      <span className="text-text-primary">{String(p.name ?? '')}</span>
                      <span className="ml-auto text-text-muted uppercase text-[10px]">{String(p.position ?? '').slice(0,2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Predictions' && (
          <PredictionTab matchId={id} homeTeam={String(homeTeam?.name ?? '')} awayTeam={String(awayTeam?.name ?? '')} />
        )}
      </motion.div>
    </div>
  )
}

function PredictionTab({ matchId, homeTeam, awayTeam }: { matchId: string; homeTeam: string; awayTeam: string }) {
  const [pred, setPred]     = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const runPrediction = async () => {
    setLoading(true)
    // We need the full context — for now we show what we have from stored predictions
    // In production, the daily schedule pre-populates predictions for all matches
    const res = await fetch(`/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, homeTeamId: '', awayTeamId: '', seasonId: '', scheduled: '' }),
    })
    const data = await res.json()
    setPred(data)
    setLoading(false)
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2"><Target size={14} /> XScore Prediction</h3>
      </div>
      {!pred ? (
        <div className="text-center py-8">
          <p className="text-text-muted text-sm mb-4">Pre-match predictions are generated automatically before kick-off.</p>
        </div>
      ) : (
        <PredictionDisplay pred={pred} homeTeam={homeTeam} awayTeam={awayTeam} />
      )}
    </div>
  )
}

function PredictionDisplay({ pred, homeTeam, awayTeam }: { pred: Record<string, unknown>; homeTeam: string; awayTeam: string }) {
  const hp = Number(pred.home_win_prob ?? 0)
  const dp = Number(pred.draw_prob ?? 0)
  const ap = Number(pred.away_win_prob ?? 0)
  const conf = Number(pred.confidence_score ?? 0)
  const volatility = String(pred.volatility ?? '')
  const volColor: Record<string, string> = { LOW: 'text-win', MEDIUM: 'text-gold', HIGH: 'text-warning', CHAOTIC: 'text-danger' }

  return (
    <div className="space-y-5">
      <ProbabilityBar home={hp} draw={dp} away={ap} size="lg" showLabels />

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Confidence" value={`${conf}%`} color={conf > 65 ? 'text-win' : conf > 40 ? 'text-gold' : 'text-danger'} />
        <StatTile label="Volatility" value={volatility} color={volColor[volatility] ?? 'text-text-muted'} />
        <StatTile label="Upset Risk" value={`${Math.round(Number(pred.upset_risk ?? 0) * 100)}%`} color="text-text-secondary" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GoalTile label="xG" home={Number(pred.expected_goals_home ?? 0)} away={Number(pred.expected_goals_away ?? 0)} homeTeam={homeTeam} awayTeam={awayTeam} />
        <div className="glass rounded-xl p-3 space-y-2">
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Goals Market</p>
          {[['O/1.5', Number(pred.over_15_prob ?? 0)], ['O/2.5', Number(pred.over_25_prob ?? 0)], ['O/3.5', Number(pred.over_35_prob ?? 0)], ['BTTS', Number(pred.btts_prob ?? 0)]].map(([label, prob]) => (
            <div key={String(label)} className="flex justify-between text-xs">
              <span className="text-text-secondary">{label}</span>
              <span className={`font-semibold ${Number(prob) > 0.6 ? 'text-win' : Number(prob) > 0.4 ? 'text-gold' : 'text-text-muted'}`}>{Math.round(Number(prob)*100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {Array.isArray(pred.signals) && pred.signals.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Signal Breakdown</p>
          {(pred.signals as Array<Record<string, unknown>>).slice(0, 8).map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${ s.direction === 'home' ? 'bg-primary' : s.direction === 'away' ? 'bg-info' : 'bg-text-muted' }`} />
              <span className="text-text-secondary">{String(s.signal ?? '')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-bold text-sm ${color}`}>{value}</p>
    </div>
  )
}

function GoalTile({ label, home, away, homeTeam, awayTeam }: { label: string; home: number; away: number; homeTeam: string; awayTeam: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">{label}</p>
      <div className="flex justify-between text-xs">
        <div className="text-center">
          <p className="font-bold text-primary text-base">{home.toFixed(2)}</p>
          <p className="text-text-muted">{homeTeam.split(' ').pop()}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-info text-base">{away.toFixed(2)}</p>
          <p className="text-text-muted">{awayTeam.split(' ').pop()}</p>
        </div>
      </div>
    </div>
  )
}

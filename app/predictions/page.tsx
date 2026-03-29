'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProbabilityBar } from '@/components/ui/ProbabilityBar'
import { SkeletonCard }   from '@/components/ui/SkeletonCard'
import { Zap, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

type StoredPrediction = {
  id: string; match_id: string
  home_team?: string; away_team?: string; scheduled?: string
  predicted_outcome: string; confidence: number
  home_win_prob: number; draw_prob: number; away_win_prob: number
  expected_goals_home: number; expected_goals_away: number
  over_25_prob: number; btts_prob: number
  volatility: string; upset_risk: number
  data_completeness: number; model_version: string
  signals?: string
}

const VOL_COLOR: Record<string, string> = {
  LOW:     'text-win   bg-win/10   border-win/20',
  MEDIUM:  'text-gold  bg-gold/10  border-gold/20',
  HIGH:    'text-warning bg-warning/10 border-warning/20',
  CHAOTIC: 'text-danger  bg-danger/10  border-danger/20',
}

const OUTCOME_LABEL: Record<string, string> = { home: 'HOME WIN', draw: 'DRAW', away: 'AWAY WIN' }
const OUTCOME_COLOR: Record<string, string> = { home: 'text-primary', draw: 'text-gold', away: 'text-info' }

export default function PredictionsPage() {
  const [preds, setPreds]       = useState<StoredPrediction[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'all'|'home'|'draw'|'away'>('all')
  const [sortBy, setSortBy]     = useState<'confidence'|'scheduled'>('confidence')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/predictions').then(r => r.json()).then(d => { setPreds(d.predictions ?? []); setLoading(false) })
  }, [])

  const filtered = preds
    .filter(p => filter === 'all' || p.predicted_outcome === filter)
    .sort((a, b) => sortBy === 'confidence' ? b.confidence - a.confidence : new Date(a.scheduled ?? '').getTime() - new Date(b.scheduled ?? '').getTime())

  const stats = {
    total:       preds.length,
    homeWins:    preds.filter(p => p.predicted_outcome === 'home').length,
    draws:       preds.filter(p => p.predicted_outcome === 'draw').length,
    awayWins:    preds.filter(p => p.predicted_outcome === 'away').length,
    avgConf:     preds.length ? Math.round(preds.reduce((s, p) => s + p.confidence, 0) / preds.length * 100) : 0,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary flex items-center gap-3">
          <Zap size={28} className="text-primary" />
          Predictions
        </h1>
        <p className="text-text-secondary mt-1 text-sm">10-layer ensemble model — every signal, not just Poisson</p>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: (<Target size={14}/>), color: 'text-text-primary' },
            { label: 'Home Wins', value: stats.homeWins, icon: (<CheckCircle size={14}/>), color: 'text-primary' },
            { label: 'Draws', value: stats.draws, icon: (<TrendingUp size={14}/>), color: 'text-gold' },
            { label: 'Away Wins', value: stats.awayWins, icon: (<CheckCircle size={14}/>), color: 'text-info' },
            { label: 'Avg Confidence', value: `${stats.avgConf}%`, icon: (<AlertTriangle size={14}/>), color: stats.avgConf > 60 ? 'text-win' : 'text-warning' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all','home','draw','away'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${
              filter === f ? 'bg-primary/10 text-primary border-primary/30' : 'border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-sm text-text-secondary focus:outline-none"
          >
            <option value="confidence">Sort: Confidence</option>
            <option value="scheduled">Sort: Kick-off</option>
          </select>
        </div>
      </div>

      {/* Predictions list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} rows={2} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Zap size={40} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">No predictions generated yet.</p>
          <p className="text-text-muted text-sm mt-2">Predictions are generated automatically before kick-off for all scheduled matches.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((p, i) => (
              <PredictionRow
                key={p.id}
                pred={p}
                index={i}
                expanded={expanded === p.id}
                onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function PredictionRow({ pred, index, expanded, onToggle }: { pred: StoredPrediction; index: number; expanded: boolean; onToggle: () => void }) {
  const signals = pred.signals ? JSON.parse(pred.signals) as Array<Record<string, unknown>> : []
  const confPct  = Math.round(pred.confidence * 100)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="glass rounded-2xl overflow-hidden">
        {/* Summary row */}
        <button className="w-full p-4 text-left" onClick={onToggle}>
          <div className="flex items-center gap-4">
            {/* Teams */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {pred.home_team ?? 'Home'} <span className="text-text-muted">vs</span> {pred.away_team ?? 'Away'}
              </p>
              {pred.scheduled && (
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(pred.scheduled).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            {/* Prediction badge */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold tracking-wider ${OUTCOME_COLOR[pred.predicted_outcome]}`}>
                {OUTCOME_LABEL[pred.predicted_outcome]}
              </span>

              {/* Confidence ring */}
              <ConfidenceRing value={confPct} />

              {/* Volatility badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${VOL_COLOR[pred.volatility] ?? 'text-text-muted'}`}>
                {pred.volatility}
              </span>

              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                className="text-text-muted text-xs"
              >
                ▾
              </motion.span>
            </div>
          </div>

          {/* Prob bar always visible */}
          <div className="mt-3">
            <ProbabilityBar home={pred.home_win_prob} draw={pred.draw_prob} away={pred.away_win_prob} />
          </div>
        </button>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-4">
                {/* Goals + Markets */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-2 rounded-xl p-3">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Expected Goals</p>
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <p className="font-bold text-primary text-base">{(pred.expected_goals_home ?? 0).toFixed(2)}</p>
                        <p className="text-text-muted text-xs">Home xG</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-info text-base">{(pred.expected_goals_away ?? 0).toFixed(2)}</p>
                        <p className="text-text-muted text-xs">Away xG</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-2 rounded-xl p-3">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Goals Market</p>
                    <div className="space-y-1">
                      {[['O/2.5', pred.over_25_prob], ['BTTS', pred.btts_prob]].map(([label, prob]) => (
                        <div key={String(label)} className="flex justify-between text-xs">
                          <span className="text-text-secondary">{label}</span>
                          <span className={`font-bold ${Number(prob) > 0.6 ? 'text-win' : Number(prob) > 0.4 ? 'text-gold' : 'text-danger'}`}>
                            {Math.round(Number(prob) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Signals */}
                {signals.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">Signal Breakdown ({signals.length} signals)</p>
                    {signals.slice(0, 6).map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          s.direction === 'home' ? 'bg-primary' : s.direction === 'away' ? 'bg-info' : 'bg-text-muted'
                        }`} />
                        <span className="text-text-secondary">{String(s.signal ?? '')}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex gap-3 text-[10px] text-text-muted">
                  <span>Data completeness: {Math.round((pred.data_completeness ?? 0) * 100)}%</span>
                  <span>Model: v{pred.model_version}</span>
                  <span>Upset risk: {Math.round((pred.upset_risk ?? 0) * 100)}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function ConfidenceRing({ value }: { value: number }) {
  const r   = 14
  const circ = 2 * Math.PI * r
  const color = value > 65 ? '#00ff87' : value > 40 ? '#ffd700' : '#ff4545'
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="40" height="40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#1a2f4a" strokeWidth="3" />
        <motion.circle
          cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (value / 100) * circ }}
          transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}
        />
      </svg>
      <span className="text-[10px] font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

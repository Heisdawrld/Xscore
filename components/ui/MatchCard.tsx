'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { LiveBadge } from './LiveBadge'
import { ProbabilityBar } from './ProbabilityBar'
import { FormStrip } from './FormStrip'

interface Team {
  id:           string
  name:         string
  abbreviation: string
}

interface MatchCardProps {
  matchId:     string
  homeTeam:    Team
  awayTeam:    Team
  homeScore?:  number
  awayScore?:  number
  status:      string   // 'live' | 'scheduled' | 'ended'
  minute?:     number
  scheduled:   string
  competition: string
  homeWinProb?: number
  drawProb?:    number
  awayWinProb?: number
  homeForm?:    string[]  // ['W','W','D','L','W']
  awayForm?:    string[]
  index?:       number
}

export function MatchCard({
  matchId, homeTeam, awayTeam, homeScore, awayScore,
  status, minute, scheduled, competition,
  homeWinProb, drawProb, awayWinProb,
  homeForm, awayForm, index = 0,
}: MatchCardProps) {
  const isLive   = status === 'live' || status === 'inprogress'
  const isEnded  = status === 'closed' || status === 'ended'
  const showProbs = homeWinProb != null && drawProb != null && awayWinProb != null

  const timeLabel = isLive
    ? `${minute ?? 0}'`
    : isEnded
    ? 'FT'
    : new Date(scheduled).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
    >
      <Link href={`/match/${matchId}`}>
        <div className={`
          glass rounded-2xl p-4 cursor-pointer transition-all duration-200
          hover:shadow-card-hover hover:border-primary/20
          ${ isLive ? 'border-live/30 shadow-glow-live' : 'border-transparent' }
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted truncate max-w-[140px]">{competition}</span>
            {isLive ? (
              <LiveBadge minute={minute} />
            ) : (
              <span className={`text-xs font-semibold ${ isEnded ? 'text-text-muted' : 'text-text-secondary' }`}>
                {timeLabel}
              </span>
            )}
          </div>

          {/* Teams + Score */}
          <div className="space-y-2">
            {/* Home */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-bold text-text-secondary flex-shrink-0">
                  {homeTeam.abbreviation.slice(0, 3)}
                </div>
                <span className="text-sm font-semibold text-text-primary truncate">{homeTeam.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {homeForm && <FormStrip results={homeForm} />}
                <motion.span
                  key={homeScore}
                  animate={isLive && homeScore != null ? { scale: [1.3, 1] } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`text-lg font-bold w-6 text-center ${
                    isLive ? 'text-primary' : 'text-text-primary'
                  }`}
                >
                  {homeScore ?? (isEnded ? '–' : '')}
                </motion.span>
              </div>
            </div>

            {/* Away */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-bold text-text-secondary flex-shrink-0">
                  {awayTeam.abbreviation.slice(0, 3)}
                </div>
                <span className="text-sm font-semibold text-text-primary truncate">{awayTeam.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {awayForm && <FormStrip results={awayForm} />}
                <motion.span
                  key={awayScore}
                  animate={isLive && awayScore != null ? { scale: [1.3, 1] } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`text-lg font-bold w-6 text-center ${
                    isLive ? 'text-primary' : 'text-text-primary'
                  }`}
                >
                  {awayScore ?? (isEnded ? '–' : '')}
                </motion.span>
              </div>
            </div>
          </div>

          {/* Probability bar */}
          {showProbs && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <ProbabilityBar home={homeWinProb!} draw={drawProb!} away={awayWinProb!} />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

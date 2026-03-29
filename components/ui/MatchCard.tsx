'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { LiveBadge }      from './LiveBadge'
import { ProbabilityBar } from './ProbabilityBar'
import { FormStrip }      from './FormStrip'

interface Team { id: string; name: string; abbreviation: string }

interface MatchCardProps {
  matchId: string
  homeTeam: Team; awayTeam: Team
  homeScore?: number; awayScore?: number
  status: string; minute?: number
  scheduled: string; competition: string
  homeWinProb?: number; drawProb?: number; awayWinProb?: number
  homeForm?: string[]; awayForm?: string[]
  index?: number
}

export function MatchCard({
  matchId, homeTeam, awayTeam, homeScore, awayScore,
  status, minute, scheduled, competition,
  homeWinProb, drawProb, awayWinProb,
  homeForm, awayForm, index = 0,
}: MatchCardProps) {
  const isLive  = ['live','inprogress','1st_half','2nd_half','halftime'].includes(status)
  const isEnded = ['closed','ended','complete'].includes(status)
  const showScore = isLive || isEnded
  const showProbs = homeWinProb != null && drawProb != null && awayWinProb != null

  const timeLabel = isLive
    ? (minute ? `${minute}'` : 'LIVE')
    : isEnded ? 'FT'
    : new Date(scheduled).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(12px)',
    border: isLive ? '1px solid rgba(255,69,69,0.3)' : '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 16,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: isLive ? '0 0 20px rgba(255,69,69,0.12)' : '0 4px 24px rgba(0,0,0,0.4)',
    textDecoration: 'none',
    display: 'block',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.22,1,0.36,1] }}
      whileHover={{ y: -3, boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,135,0.15)' }}
    >
      <Link href={`/match/${matchId}`} style={card}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#4a6fa5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{competition}</span>
          {isLive
            ? <LiveBadge minute={minute} />
            : <span style={{ fontSize: 11, fontWeight: 600, color: isEnded ? '#4a6fa5' : '#8bafc7' }}>{timeLabel}</span>
          }
        </div>

        {/* Teams */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ team: homeTeam, score: homeScore, form: homeForm }, { team: awayTeam, score: awayScore, form: awayForm }].map(({ team, score, form }, ti) => (
            <div key={ti} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#1a2f4a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: '#8bafc7', flexShrink: 0,
                }}>
                  {team.abbreviation?.slice(0,3).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e8f4fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {team.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {form && <FormStrip results={form} />}
                {showScore && (
                  <motion.span
                    key={score}
                    animate={isLive ? { scale: [1.25, 1] } : {}}
                    transition={{ type: 'spring', stiffness: 400 }}
                    style={{ fontSize: 18, fontWeight: 800, width: 22, textAlign: 'center', color: isLive ? '#00ff87' : '#e8f4fd' }}
                  >
                    {score ?? 0}
                  </motion.span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Prob bar */}
        {showProbs && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <ProbabilityBar home={homeWinProb!} draw={drawProb!} away={awayWinProb!} />
          </div>
        )}
      </Link>
    </motion.div>
  )
}

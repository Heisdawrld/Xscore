'use client'
import { formatDateTime, formatTime } from '@/lib/utils/date'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LiveBadge }      from '@/components/ui/LiveBadge'
import { StatBar }        from '@/components/ui/StatBar'
import { ProbabilityBar } from '@/components/ui/ProbabilityBar'
import { SkeletonCard }   from '@/components/ui/SkeletonCard'

const TABS = ['Overview','Stats','Lineups','Predictions'] as const
type Tab = typeof TABS[number]



export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData]       = useState<Record<string,unknown>|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState<Tab>('Overview')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    fetch(`/api/match?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        setData(d)
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [id])

  // ---- Safe data extraction ----
  const summary  = data?.summary  as Record<string,unknown> | null | undefined
  const event    = summary?.sport_event    as Record<string,unknown> | undefined
  const evStatus = summary?.sport_event_status as Record<string,unknown> | undefined
  const stats    = summary?.statistics    as Record<string,unknown> | undefined

  const competitors = (event?.competitors as Array<Record<string,unknown>>) ?? []
  const homeTeam    = competitors.find(c => c.qualifier === 'home')
  const awayTeam    = competitors.find(c => c.qualifier === 'away')

  const matchStatus = String(evStatus?.match_status ?? '')
  const isLive      = ['inprogress','live','1st_half','2nd_half','halftime'].includes(matchStatus)
  const isEnded     = ['closed','ended','complete'].includes(matchStatus)
  const homeScore   = evStatus?.home_score as number | undefined
  const awayScore   = evStatus?.away_score as number | undefined

  const ctx         = event?.sport_event_context as Record<string,unknown> | undefined
  const compName    = String((ctx?.competition as Record<string,unknown>)?.name ?? '')
  const scheduledAt = formatDateTime(event?.scheduled)

  const statsTotals   = (stats as Record<string,unknown>)?.totals as Record<string,unknown> | undefined
  const homeStats     = (statsTotals?.competitors as Array<Record<string,unknown>>)?.find(c => c.qualifier==='home')?.statistics as Record<string,number> | undefined
  const awayStats     = (statsTotals?.competitors as Array<Record<string,unknown>>)?.find(c => c.qualifier==='away')?.statistics as Record<string,number> | undefined

  // Probabilities
  const probData    = data?.probs as Record<string,unknown> | undefined
  const probMarkets = (probData?.probabilities as Record<string,unknown>)?.markets as Array<Record<string,unknown>> | undefined
  const market3way  = probMarkets?.find(m => ['3way','match_winner','1x2'].includes(String(m.name)))
  const outcomes    = (market3way?.outcomes as Array<Record<string,unknown>>) ?? []
  const homeProb    = Number(outcomes.find(o => ['1','home_team'].includes(String(o.name)))?.probability ?? 0)
  const drawProb    = Number(outcomes.find(o => ['X','draw'].includes(String(o.name)))?.probability ?? 0)
  const awayProb    = Number(outcomes.find(o => ['2','away_team'].includes(String(o.name)))?.probability ?? 0)

  const factsList   = ((data?.facts as Record<string,unknown>)?.facts as Array<Record<string,unknown>>) ?? []
  const lineupList  = ((data?.lineups as Record<string,unknown>)?.lineups as Array<Record<string,unknown>>) ?? []

  // Period scores
  const periods = (evStatus?.period_scores as Array<Record<string,unknown>>) ?? []

  if (loading) return (
    <div style={{ maxWidth:700, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>
      <SkeletonCard rows={3} />
      <SkeletonCard rows={2} />
    </div>
  )

  if (error && !summary) return (
    <div style={{ textAlign:'center', padding:'64px 24px', color:'#4a6fa5' }}>
      <p style={{ fontSize:15 }}>Match data unavailable</p>
      <p style={{ fontSize:12, marginTop:8, color:'#1e3a5f', wordBreak:'break-all' }}>{error}</p>
    </div>
  )

  return (
    <div style={{ maxWidth:700, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>

      {/* ===== SCORE HERO ===== */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'20px 16px' }}>

        {/* Competition + status */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <span style={{ fontSize:11, color:'#4a6fa5', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{compName}</span>
          {isLive ? <LiveBadge /> : <span style={{ fontSize:11, fontWeight:600, color: isEnded ? '#4a6fa5' : '#ffd700' }}>{isEnded ? 'FT' : (scheduledAt || 'Scheduled')}</span>}
        </div>

        {/* Teams + Score */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
          {/* Home */}
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'#1a2f4a', margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#8bafc7' }}>
              {String(homeTeam?.abbreviation ?? '?').slice(0,3).toUpperCase()}
            </div>
            <p style={{ fontSize:13, fontWeight:600, color:'#e8f4fd', lineHeight:1.2 }}>{String(homeTeam?.name ?? 'Home')}</p>
          </div>

          {/* Score block */}
          <div style={{ textAlign:'center', minWidth:100 }}>
            {(isLive || isEnded) ? (
              <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                <motion.span key={homeScore} animate={{scale:[1.15,1]}} transition={{type:'spring',stiffness:400}}
                  style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:46, fontWeight:800, color: isLive ? '#00ff87' : '#e8f4fd', lineHeight:1 }}>
                  {homeScore ?? 0}
                </motion.span>
                <span style={{ fontSize:28, color:'#1e3a5f', fontWeight:300 }}>:</span>
                <motion.span key={awayScore} animate={{scale:[1.15,1]}} transition={{type:'spring',stiffness:400}}
                  style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:46, fontWeight:800, color: isLive ? '#00ff87' : '#e8f4fd', lineHeight:1 }}>
                  {awayScore ?? 0}
                </motion.span>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:28, fontWeight:700, color:'#ffd700', lineHeight:1 }}>VS</p>
                <p style={{ fontSize:11, color:'#4a6fa5', marginTop:6 }}>{scheduledAt || 'TBD'}</p>
              </div>
            )}
            {/* Period scores */}
            {periods.length > 0 && (
              <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:6 }}>
                {periods.map((p,i) => (
                  <span key={i} style={{ fontSize:10, color:'#4a6fa5', background:'#112240', padding:'2px 6px', borderRadius:4 }}>
                    {String(p.type??'').replace('regular_period','HT').replace('overtime','OT').replace('penalties','PEN')} {Number(p.home_score??0)}-{Number(p.away_score??0)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Away */}
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'#1a2f4a', margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#8bafc7' }}>
              {String(awayTeam?.abbreviation ?? '?').slice(0,3).toUpperCase()}
            </div>
            <p style={{ fontSize:13, fontWeight:600, color:'#e8f4fd', lineHeight:1.2 }}>{String(awayTeam?.name ?? 'Away')}</p>
          </div>
        </div>

        {/* Probability bar */}
        {(homeProb + drawProb + awayProb) > 0 && (
          <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <ProbabilityBar home={homeProb} draw={drawProb} away={awayProb} size="lg" showLabels />
          </div>
        )}
      </motion.div>

      {/* ===== TABS ===== */}
      <div style={{ display:'flex', gap:4, padding:4, background:'#0d1b2a', borderRadius:14, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex:'1 0 auto', padding:'9px 14px', borderRadius:10, fontSize:12, fontWeight:600,
            cursor:'pointer', border:'none', whiteSpace:'nowrap',
            background: tab===t ? 'rgba(0,255,135,0.12)' : 'transparent',
            color:      tab===t ? '#00ff87' : '#8bafc7',
            outline:    tab===t ? '1px solid rgba(0,255,135,0.25)' : 'none',
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* ===== TAB CONTENT ===== */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2}}>

          {/* OVERVIEW */}
          {tab === 'Overview' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {factsList.length > 0 ? (
                <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:10 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:'#4a6fa5', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Match Facts</p>
                  {factsList.map((f,i) => (
                    <p key={i} style={{ fontSize:13, color:'#8bafc7', borderLeft:'2px solid rgba(0,255,135,0.3)', paddingLeft:10 }}>{String(f.statement??'')}</p>
                  ))}
                </div>
              ) : (
                <EmptyTab msg={isEnded ? 'No facts available for this match.' : 'Match facts appear after kick-off.'} />
              )}
            </div>
          )}

          {/* STATS */}
          {tab === 'Stats' && (
            homeStats && awayStats ? (
              <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'16px 14px', display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { label:'Possession',    hv: homeStats.ball_possession ??0, av: awayStats.ball_possession ??0, fmt:(v:number)=>`${v}%` },
                  { label:'Shots Total',   hv: homeStats.shots_total     ??0, av: awayStats.shots_total     ??0 },
                  { label:'On Target',     hv: homeStats.shots_on_target ??0, av: awayStats.shots_on_target ??0 },
                  { label:'Corners',       hv: homeStats.corner_kicks    ??0, av: awayStats.corner_kicks    ??0 },
                  { label:'Fouls',         hv: homeStats.fouls           ??0, av: awayStats.fouls           ??0 },
                  { label:'Yellow Cards',  hv: homeStats.yellow_cards    ??0, av: awayStats.yellow_cards    ??0 },
                  { label:'Red Cards',     hv: homeStats.red_cards       ??0, av: awayStats.red_cards       ??0 },
                  { label:'Offsides',      hv: homeStats.offsides        ??0, av: awayStats.offsides        ??0 },
                ].map(s => <StatBar key={s.label} label={s.label} homeVal={s.hv} awayVal={s.av} format={s.fmt} />)}
              </div>
            ) : (
              <EmptyTab msg={isEnded ? 'No detailed stats available for this match.' : 'Stats appear after kick-off.'} />
            )
          )}

          {/* LINEUPS */}
          {tab === 'Lineups' && (
            lineupList.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {lineupList.map((comp) => {
                  const c = comp as { id:string; name:string; qualifier:string; formation?:string; players?:Array<{id:string;name:string;position?:string;jersey_number?:number;starter?:boolean}> }
                  return (
                    <div key={c.id} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:12, overflow:'hidden' }}>
                      <div style={{ marginBottom:10, paddingBottom:8, borderBottom:'1px solid #1e3a5f' }}>
                        <p style={{ fontSize:12, fontWeight:700, color:'#e8f4fd' }}>{c.name}</p>
                        {c.formation && <p style={{ fontSize:10, color:'#00ff87', marginTop:2 }}>{c.formation}</p>}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                        {(c.players ?? []).filter(p => p.starter).map(p => (
                          <div key={p.id} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
                            <span style={{ width:18, textAlign:'center', color:'#4a6fa5', fontWeight:700, flexShrink:0 }}>{p.jersey_number ?? ''}</span>
                            <span style={{ color:'#e8f4fd', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
                            <span style={{ marginLeft:'auto', color:'#4a6fa5', fontSize:9, textTransform:'uppercase', flexShrink:0 }}>{String(p.position??'').slice(0,1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyTab msg="Lineups are published closer to kick-off." />
            )
          )}

          {/* PREDICTIONS */}
          {tab === 'Predictions' && (
            <PredictionPanel matchId={id} homeTeam={String(homeTeam?.name??'')} awayTeam={String(awayTeam?.name??'')} scheduled={String(event?.scheduled??'')} />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function EmptyTab({ msg }: { msg: string }) {
  return (
    <div style={{ textAlign:'center', padding:'48px 24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16 }}>
      <p style={{ color:'#4a6fa5', fontSize:14 }}>{msg}</p>
    </div>
  )
}

function PredictionPanel({ matchId, homeTeam, awayTeam, scheduled }: { matchId:string; homeTeam:string; awayTeam:string; scheduled:string }) {
  const [pred, setPred]     = useState<Record<string,unknown>|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  // Check if a stored prediction exists
  useEffect(() => {
    fetch(`/api/predictions?matchId=${encodeURIComponent(matchId)}`)
      .then(r=>r.json())
      .then(d => {
        const match = (d.predictions as Array<Record<string,unknown>>)?.find((p:Record<string,unknown>) => p.match_id === matchId)
        if (match) setPred(match)
      })
  }, [matchId])

  if (pred) return <PredictionDisplay pred={pred} homeTeam={homeTeam} awayTeam={awayTeam} />

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'24px 16px', textAlign:'center' }}>
      <p style={{ color:'#4a6fa5', fontSize:13, marginBottom:16 }}>No prediction generated for this match yet.</p>
      {error && <p style={{ color:'#ff4545', fontSize:12, marginBottom:12 }}>{error}</p>}
      {loading && <p style={{ color:'#8bafc7', fontSize:13 }}>Generating prediction…</p>}
    </div>
  )
}

function PredictionDisplay({ pred, homeTeam, awayTeam }: { pred:Record<string,unknown>; homeTeam:string; awayTeam:string }) {
  const hp  = Number(pred.home_win_prob??0)
  const dp  = Number(pred.draw_prob??0)
  const ap  = Number(pred.away_win_prob??0)
  const conf = Math.round(Number(pred.confidence??0)*100)
  const vol  = String(pred.volatility??'')
  const VOL_C: Record<string,string> = { LOW:'#00ff87', MEDIUM:'#ffd700', HIGH:'#ff9500', CHAOTIC:'#ff4545' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:16 }}>
        <ProbabilityBar home={hp} draw={dp} away={ap} size="lg" showLabels />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        {[['Confidence',`${conf}%`,conf>65?'#00ff87':conf>40?'#ffd700':'#ff4545'],['Volatility',vol,VOL_C[vol]??'#8bafc7'],['Upset Risk',`${Math.round(Number(pred.upset_risk??0)*100)}%`,'#8bafc7']].map(([l,v,c])=>(
          <div key={l as string} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
            <p style={{ fontSize:10, color:'#4a6fa5', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{l as string}</p>
            <p style={{ fontSize:16, fontWeight:800, color: c as string }}>{v as string}</p>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:12 }}>
          <p style={{ fontSize:10, color:'#4a6fa5', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>xG</p>
          <div style={{ display:'flex', justifyContent:'space-around' }}>
            <div style={{ textAlign:'center' }}><p style={{ fontSize:20, fontWeight:800, color:'#00ff87' }}>{Number(pred.expected_goals_home??0).toFixed(2)}</p><p style={{ fontSize:10, color:'#4a6fa5' }}>{homeTeam.split(' ').slice(-1)[0]}</p></div>
            <div style={{ textAlign:'center' }}><p style={{ fontSize:20, fontWeight:800, color:'#00b4d8' }}>{Number(pred.expected_goals_away??0).toFixed(2)}</p><p style={{ fontSize:10, color:'#4a6fa5' }}>{awayTeam.split(' ').slice(-1)[0]}</p></div>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:12 }}>
          <p style={{ fontSize:10, color:'#4a6fa5', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Goals Market</p>
          {[['O/2.5', Number(pred.over_25_prob??0)],['BTTS', Number(pred.btts_prob??0)],['O/1.5', Number(pred.over_15_prob??0)]].map(([l,p])=>(
            <div key={String(l)} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:12, color:'#8bafc7' }}>{l}</span>
              <span style={{ fontSize:12, fontWeight:700, color: Number(p)>0.6?'#00ff87':Number(p)>0.4?'#ffd700':'#ff4545' }}>{Math.round(Number(p)*100)}%</span>
            </div>
          ))}
        </div>
      </div>
      {Array.isArray(pred.signals) && (pred.signals as Array<Record<string,unknown>>).length > 0 && (
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:14 }}>
          <p style={{ fontSize:10, color:'#4a6fa5', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Signal Breakdown</p>
          {(pred.signals as Array<Record<string,unknown>>).slice(0,8).map((s,i)=>(
            <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:s.direction==='home'?'#00ff87':s.direction==='away'?'#00b4d8':'#4a6fa5', flexShrink:0, marginTop:5 }} />
              <span style={{ fontSize:12, color:'#8bafc7', lineHeight:1.4 }}>{String(s.signal??'')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

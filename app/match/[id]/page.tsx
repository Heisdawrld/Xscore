'use client'
import { formatDateTime, formatTime } from '@/lib/utils/date'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LiveBadge }      from '@/components/ui/LiveBadge'
import { StatBar }        from '@/components/ui/StatBar'
import { ProbabilityBar } from '@/components/ui/ProbabilityBar'
import { SkeletonCard }   from '@/components/ui/SkeletonCard'

const TABS = ['Preview','Stats','Lineups','Prediction'] as const
type Tab = typeof TABS[number]

// ---- type helpers ----
type MatchSummary    = Record<string,unknown>
type PreviewData     = Record<string,unknown>
type FormEntry       = { result:'W'|'D'|'L'; myScore:number; opScore:number; opponent:string; scheduled:string }
type H2HEntry        = { matchId:string; homeTeam:string; awayTeam:string; homeScore?:number; awayScore?:number; winnerId?:string; scheduled:string; competition:string }
type MissingPlayer   = { player:{ id:string; name:string; position?:string }; type:string; reason?:string }
type StandingEntry   = { rank:number; played:number; win:number; draw:number; loss:number; points:number; goals_diff:number }

const RESULT_COLOR: Record<string,string> = { W:'#00ff87', D:'#ffd700', L:'#ff4545' }

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [matchData, setMatchData] = useState<MatchSummary|null>(null)
  const [preview,   setPreview]   = useState<PreviewData|null>(null)
  const [loading,   setLoading]   = useState(true)
  const [prevLoad,  setPrevLoad]  = useState(false)
  const [tab,       setTab]       = useState<Tab>('Preview')

  // Fetch core match data
  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/match?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(d => { setMatchData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  // Once we have team IDs + season, fetch pre-match preview
  useEffect(() => {
    if (!matchData) return
    const ev      = matchData.summary as Record<string,unknown> | undefined
    const event   = ev?.sport_event as Record<string,unknown> | undefined
    const comps   = (event?.competitors as Array<Record<string,unknown>>) ?? []
    const homeId  = comps.find(c => c.qualifier === 'home')?.id as string
    const awayId  = comps.find(c => c.qualifier === 'away')?.id as string
    const seasonCtx = (event?.sport_event_context as Record<string,unknown>)?.season
    const seasonId  = seasonCtx ? String((seasonCtx as Record<string,unknown>)?.id ?? '') : ''
    if (!homeId || !awayId) return
    setPrevLoad(true)
    const params = new URLSearchParams({ homeId, awayId })
    if (seasonId) params.set('seasonId', seasonId)
    fetch(`/api/match-preview?${params}`)
      .then(r => r.json())
      .then(d => { setPreview(d); setPrevLoad(false) })
      .catch(() => setPrevLoad(false))
  }, [matchData])

  // ---- Data extraction ----
  const summary  = (matchData?.summary as Record<string,unknown> | undefined)
  const event    = summary?.sport_event    as Record<string,unknown> | undefined
  const evStatus = summary?.sport_event_status as Record<string,unknown> | undefined
  const stats    = summary?.statistics    as Record<string,unknown> | undefined

  const competitors = (event?.competitors as Array<Record<string,unknown>>) ?? []
  const homeTeam    = competitors.find(c => c.qualifier === 'home')
  const awayTeam    = competitors.find(c => c.qualifier === 'away')
  const homeId      = homeTeam?.id as string
  const awayId      = awayTeam?.id as string
  const seasonCtx2  = (event?.sport_event_context as Record<string,unknown>)?.season
  const seasonId    = seasonCtx2 ? String((seasonCtx2 as Record<string,unknown>)?.id ?? '') : ''

  const matchStatus = String(evStatus?.match_status ?? 'not_started')
  const isLive      = ['inprogress','live','1st_half','2nd_half','halftime'].includes(matchStatus)
  const isEnded     = ['closed','ended','complete'].includes(matchStatus)
  const isScheduled = !isLive && !isEnded

  const homeScore   = evStatus?.home_score as number | undefined
  const awayScore   = evStatus?.away_score as number | undefined
  const compName    = String((event?.sport_event_context as Record<string,unknown> | undefined && ((event!.sport_event_context as Record<string,unknown>).competition as Record<string,unknown> | undefined)?.name) ?? '')
  const kickoffTime = formatDateTime(event?.scheduled)

  // Live/match stats
  const statsTotals = (stats as Record<string,unknown>)?.totals as Record<string,unknown> | undefined
  const homeLiveStats = (statsTotals?.competitors as Array<Record<string,unknown>>)?.find(c => c.qualifier==='home')?.statistics as Record<string,number> | undefined
  const awayLiveStats = (statsTotals?.competitors as Array<Record<string,unknown>>)?.find(c => c.qualifier==='away')?.statistics as Record<string,number> | undefined

  // Probabilities
  const probMarkets = ((matchData?.probs as Record<string,unknown>)?.probabilities as Record<string,unknown>)?.markets as Array<Record<string,unknown>> | undefined
  const market3way  = probMarkets?.find(m => ['3way','match_winner','1x2'].includes(String(m.name)))
  const outcomes    = (market3way?.outcomes as Array<Record<string,unknown>>) ?? []
  const homeProb    = Number(outcomes.find(o => ['1','home_team'].includes(String(o.name)))?.probability ?? 0)
  const drawProb    = Number(outcomes.find(o => ['X','draw'].includes(String(o.name)))?.probability ?? 0)
  const awayProb    = Number(outcomes.find(o => ['2','away_team'].includes(String(o.name)))?.probability ?? 0)

  const lineupList  = ((matchData?.lineups as Record<string,unknown>)?.lineups as Array<Record<string,unknown>>) ?? []

  // Preview data
  const h2h         = (preview?.h2h         as H2HEntry[])      ?? []
  const homeForm    = (preview?.homeForm     as FormEntry[])     ?? []
  const awayForm    = (preview?.awayForm     as FormEntry[])     ?? []
  const homeSeasonStats = preview?.homeStats as Record<string,number> | null
  const awaySeasonStats = preview?.awayStats as Record<string,number> | null
  const homeMissing = (preview?.homeMissing  as MissingPlayer[]) ?? []
  const awayMissing = (preview?.awayMissing  as MissingPlayer[]) ?? []
  const homeStanding = preview?.homeStanding as StandingEntry | null
  const awayStanding = preview?.awayStanding as StandingEntry | null

  if (loading) return (
    <div style={{ maxWidth:700, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>
      <SkeletonCard rows={3}/><SkeletonCard rows={2}/>
    </div>
  )

  return (
    <div style={{ maxWidth:700, margin:'0 auto', display:'flex', flexDirection:'column', gap:14 }}>

      {/* ===== SCORE HERO ===== */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'18px 16px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontSize:11, color:'#4a6fa5', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{compName}</span>
          {isLive ? <LiveBadge /> : isEnded ? <span style={{ fontSize:11, fontWeight:700, color:'#4a6fa5' }}>FT</span> : <span style={{ fontSize:11, fontWeight:600, color:'#ffd700' }}>Upcoming</span>}
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
          {/* Home */}
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ width:50, height:50, borderRadius:13, background:'#1a2f4a', margin:'0 auto 8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#8bafc7' }}>
              {String(homeTeam?.abbreviation??'?').slice(0,3).toUpperCase()}
            </div>
            <p style={{ fontSize:13, fontWeight:600, color:'#e8f4fd', lineHeight:1.3 }}>{String(homeTeam?.name??'Home')}</p>
            {homeStanding && <p style={{ fontSize:10, color:'#4a6fa5', marginTop:2 }}>#{homeStanding.rank} · {homeStanding.points}pts</p>}
          </div>

          {/* Score / Kickoff */}
          <div style={{ textAlign:'center', minWidth:110 }}>
            {(isLive || isEnded) ? (
              <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                <motion.span key={homeScore} animate={{scale:[1.2,1]}} transition={{type:'spring',stiffness:400}}
                  style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:44, fontWeight:800, color:isLive?'#00ff87':'#e8f4fd', lineHeight:1 }}>
                  {homeScore??0}
                </motion.span>
                <span style={{ fontSize:26, color:'#1e3a5f', fontWeight:300 }}>:</span>
                <motion.span key={awayScore} animate={{scale:[1.2,1]}} transition={{type:'spring',stiffness:400}}
                  style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:44, fontWeight:800, color:isLive?'#00ff87':'#e8f4fd', lineHeight:1 }}>
                  {awayScore??0}
                </motion.span>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily:'var(--font-syne,Syne,sans-serif)', fontSize:26, fontWeight:800, color:'#ffd700' }}>VS</p>
                <p style={{ fontSize:12, color:'#8bafc7', marginTop:6, fontWeight:500 }}>{kickoffTime || 'TBD'}</p>
              </div>
            )}
          </div>

          {/* Away */}
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ width:50, height:50, borderRadius:13, background:'#1a2f4a', margin:'0 auto 8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#8bafc7' }}>
              {String(awayTeam?.abbreviation??'?').slice(0,3).toUpperCase()}
            </div>
            <p style={{ fontSize:13, fontWeight:600, color:'#e8f4fd', lineHeight:1.3 }}>{String(awayTeam?.name??'Away')}</p>
            {awayStanding && <p style={{ fontSize:10, color:'#4a6fa5', marginTop:2 }}>#{awayStanding.rank} · {awayStanding.points}pts</p>}
          </div>
        </div>

        {/* Probability bar (pre-match from Sportradar) */}
        {(homeProb + drawProb + awayProb) > 0 && (
          <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <ProbabilityBar home={homeProb} draw={drawProb} away={awayProb} size="lg" showLabels />
          </div>
        )}
      </motion.div>

      {/* ===== TABS ===== */}
      <div style={{ display:'flex', gap:3, padding:4, background:'#0d1b2a', borderRadius:14 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex:1, padding:'9px 6px', borderRadius:10, fontSize:12, fontWeight:700,
            cursor:'pointer', border:'none',
            background: tab===t ? 'rgba(0,255,135,0.12)' : 'transparent',
            color:      tab===t ? '#00ff87' : '#8bafc7',
            outline:    tab===t ? '1px solid rgba(0,255,135,0.25)' : 'none',
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* ===== TAB CONTENT ===== */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}>

          {/* ============================
              PREVIEW TAB
          ============================ */}
          {tab === 'Preview' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {prevLoad && <LoadingBlock />}

              {/* Form comparison */}
              {(homeForm.length > 0 || awayForm.length > 0) && (
                <Section title="Recent Form">
                  <FormBlock name={String(homeTeam?.name??'Home')} form={homeForm} side="home" />
                  <FormBlock name={String(awayTeam?.name??'Away')} form={awayForm} side="away" />
                </Section>
              )}

              {/* H2H */}
              {h2h.length > 0 && (
                <Section title={`Head to Head (last ${h2h.length})`}>
                  {h2h.map((m, i) => (
                    <H2HRow key={i} match={m} homeId={homeId} awayId={awayId} />
                  ))}
                </Section>
              )}

              {/* Missing Players */}
              {(homeMissing.length > 0 || awayMissing.length > 0) && (
                <Section title="Injury & Suspension News">
                  {homeMissing.length > 0 && (
                    <div style={{ marginBottom:10 }}>
                      <p style={{ fontSize:11, fontWeight:700, color:'#00ff87', marginBottom:6 }}>{String(homeTeam?.name??'')} — Missing</p>
                      {homeMissing.map((p,i) => <PlayerMissing key={i} p={p} />)}
                    </div>
                  )}
                  {awayMissing.length > 0 && (
                    <div>
                      <p style={{ fontSize:11, fontWeight:700, color:'#00b4d8', marginBottom:6 }}>{String(awayTeam?.name??'')} — Missing</p>
                      {awayMissing.map((p,i) => <PlayerMissing key={i} p={p} />)}
                    </div>
                  )}
                </Section>
              )}

              {/* Standings snapshot */}
              {(homeStanding || awayStanding) && (
                <Section title="League Standing">
                  <StandingRow name={String(homeTeam?.name??'')} s={homeStanding} color="#00ff87" />
                  <StandingRow name={String(awayTeam?.name??'')} s={awayStanding} color="#00b4d8" />
                </Section>
              )}

              {!prevLoad && h2h.length===0 && homeForm.length===0 && (
                <div style={{ textAlign:'center', padding:'40px', color:'#4a6fa5' }}>
                  <p>Pre-match data loading…</p>
                </div>
              )}
            </div>
          )}

          {/* ============================
              STATS TAB
          ============================ */}
          {tab === 'Stats' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {/* Live match stats (if in progress or ended) */}
              {(isLive || isEnded) && homeLiveStats && awayLiveStats && (
                <Section title="Match Stats">
                  {[
                    { label:'Possession',  hv:homeLiveStats.ball_possession??0, av:awayLiveStats.ball_possession??0, fmt:(v:number)=>`${v}%` },
                    { label:'Shots Total', hv:homeLiveStats.shots_total??0,     av:awayLiveStats.shots_total??0 },
                    { label:'On Target',   hv:homeLiveStats.shots_on_target??0, av:awayLiveStats.shots_on_target??0 },
                    { label:'Corners',     hv:homeLiveStats.corner_kicks??0,    av:awayLiveStats.corner_kicks??0 },
                    { label:'Fouls',       hv:homeLiveStats.fouls??0,           av:awayLiveStats.fouls??0 },
                    { label:'Yellow Cards',hv:homeLiveStats.yellow_cards??0,    av:awayLiveStats.yellow_cards??0 },
                  ].map(s => <StatBar key={s.label} label={s.label} homeVal={s.hv} awayVal={s.av} format={s.fmt} />)}
                </Section>
              )}

              {/* Season stats comparison — always shown */}
              {homeSeasonStats && awaySeasonStats ? (
                <Section title="Season Stats Comparison">
                  <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:700 }}>
                    <span style={{ color:'#00ff87' }}>{String(homeTeam?.name??'').split(' ').slice(-1)[0]}</span>
                    <span style={{ color:'#4a6fa5', textTransform:'uppercase', letterSpacing:'0.06em' }}>Stat</span>
                    <span style={{ color:'#00b4d8' }}>{String(awayTeam?.name??'').split(' ').slice(-1)[0]}</span>
                  </div>
                  {[
                    { label:'Goals Scored',   hv:homeSeasonStats.goals_scored??0,    av:awaySeasonStats.goals_scored??0 },
                    { label:'Goals Conceded', hv:homeSeasonStats.goals_conceded??0,  av:awaySeasonStats.goals_conceded??0 },
                    { label:'Shots Total',    hv:homeSeasonStats.shots_total??0,     av:awaySeasonStats.shots_total??0 },
                    { label:'On Target',      hv:homeSeasonStats.shots_on_target??0, av:awaySeasonStats.shots_on_target??0 },
                    { label:'Yellow Cards',   hv:homeSeasonStats.yellow_cards??0,    av:awaySeasonStats.yellow_cards??0 },
                    { label:'Corner Kicks',   hv:homeSeasonStats.corner_kicks??0,    av:awaySeasonStats.corner_kicks??0 },
                  ].map(s => <StatBar key={s.label} label={s.label} homeVal={s.hv} awayVal={s.av} />)}
                </Section>
              ) : prevLoad ? <LoadingBlock /> : (
                <div style={{ textAlign:'center', padding:'32px', color:'#4a6fa5', fontSize:13 }}>Season stats not available for this competition.</div>
              )}
            </div>
          )}

          {/* ============================
              LINEUPS TAB
          ============================ */}
          {tab === 'Lineups' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {lineupList.length > 0 ? (
                <Section title="Confirmed Lineups">
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {lineupList.map(comp => {
                      const c = comp as { id:string; name:string; formation?:string; players?:Array<{id:string;name:string;position?:string;jersey_number?:number;starter?:boolean}> }
                      return (
                        <div key={c.id}>
                          <p style={{ fontSize:12, fontWeight:700, color:'#e8f4fd', marginBottom:4 }}>{c.name}</p>
                          {c.formation && <p style={{ fontSize:10, color:'#00ff87', marginBottom:8 }}>{c.formation}</p>}
                          {(c.players??[]).filter(p=>p.starter).map(p => (
                            <div key={p.id} style={{ display:'flex', gap:6, alignItems:'center', marginBottom:5 }}>
                              <span style={{ width:18, fontSize:10, fontWeight:700, color:'#4a6fa5', textAlign:'center', flexShrink:0 }}>{p.jersey_number??''}</span>
                              <span style={{ fontSize:12, color:'#e8f4fd', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
                              <span style={{ marginLeft:'auto', fontSize:9, color:'#4a6fa5', flexShrink:0 }}>{String(p.position??'').slice(0,2)}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </Section>
              ) : (
                // Pre-match: show squad + injury news
                <Section title="Squad Availability">
                  {homeMissing.length > 0 && (
                    <div style={{ marginBottom:12, padding:'10px 12px', background:'rgba(255,69,69,0.06)', border:'1px solid rgba(255,69,69,0.15)', borderRadius:12 }}>
                      <p style={{ fontSize:11, fontWeight:700, color:'#ff4545', marginBottom:8 }}>⚠️ {String(homeTeam?.name??'')} — {homeMissing.length} player{homeMissing.length>1?'s':''} out</p>
                      {homeMissing.map((p,i) => <PlayerMissing key={i} p={p} />)}
                    </div>
                  )}
                  {awayMissing.length > 0 && (
                    <div style={{ padding:'10px 12px', background:'rgba(255,69,69,0.06)', border:'1px solid rgba(255,69,69,0.15)', borderRadius:12 }}>
                      <p style={{ fontSize:11, fontWeight:700, color:'#ff4545', marginBottom:8 }}>⚠️ {String(awayTeam?.name??'')} — {awayMissing.length} player{awayMissing.length>1?'s':''} out</p>
                      {awayMissing.map((p,i) => <PlayerMissing key={i} p={p} />)}
                    </div>
                  )}
                  {homeMissing.length===0 && awayMissing.length===0 && (
                    <p style={{ fontSize:13, color:'#4a6fa5' }}>Both squads at full strength. Confirmed lineups are published 1 hour before kick-off.</p>
                  )}
                </Section>
              )}
            </div>
          )}

          {/* ============================
              PREDICTION TAB
          ============================ */}
          {tab === 'Prediction' && (
            <PredictionTab
              matchId={id}
              homeId={homeId}
              awayId={awayId}
              seasonId={seasonId ?? ''}
              homeTeam={String(homeTeam?.name??'')}
              awayTeam={String(awayTeam?.name??'')}
              scheduled={String(event?.scheduled??'')}
            />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ============================
// Sub-components
// ============================

function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'14px 14px' }}>
      <p style={{ fontSize:11, fontWeight:700, color:'#4a6fa5', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>{title}</p>
      {children}
    </div>
  )
}

function LoadingBlock() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {[100,80,90].map((w,i) => (
        <div key={i} style={{ height:10, width:`${w}%`, background:'linear-gradient(90deg,#112240 25%,#1a2f4a 50%,#112240 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s linear infinite', borderRadius:6 }} />
      ))}
    </div>
  )
}

function FormBlock({ name, form, side }: { name:string; form:FormEntry[]; side:'home'|'away' }) {
  const color = side==='home' ? '#00ff87' : '#00b4d8'
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ fontSize:12, fontWeight:700, color }}>{name}</span>
        <div style={{ display:'flex', gap:4 }}>
          {form.map((f,i) => (
            <span key={i} style={{ width:22, height:22, borderRadius:6, background:RESULT_COLOR[f.result]+'22', border:`1px solid ${RESULT_COLOR[f.result]}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:RESULT_COLOR[f.result] }}>{f.result}</span>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        {form.map((f,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
            <span style={{ width:22, height:22, borderRadius:6, background:RESULT_COLOR[f.result]+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:RESULT_COLOR[f.result], flexShrink:0 }}>{f.result}</span>
            <span style={{ color:'#8bafc7', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>vs {f.opponent}</span>
            <span style={{ color:'#e8f4fd', fontWeight:700, fontFamily:'var(--font-jetbrains,monospace)', flexShrink:0 }}>{f.myScore}–{f.opScore}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function H2HRow({ match, homeId, awayId }: { match:H2HEntry; homeId:string; awayId:string }) {
  const hScore  = match.homeScore ?? 0
  const aScore  = match.awayScore ?? 0
  const isDraw  = hScore === aScore
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:12 }}>
      <span style={{ color:'#4a6fa5', fontSize:10, flexShrink:0, width:60, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{formatTime(match.scheduled)}</span>
      <span style={{ flex:1, color:'#e8f4fd', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'right' }}>{match.homeTeam}</span>
      <span style={{ fontFamily:'var(--font-jetbrains,monospace)', fontWeight:800, color: isDraw?'#ffd700':match.winnerId?'#e8f4fd':'#4a6fa5', background:'#112240', padding:'2px 8px', borderRadius:6, flexShrink:0, fontSize:13 }}>{hScore}–{aScore}</span>
      <span style={{ flex:1, color:'#e8f4fd', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.awayTeam}</span>
    </div>
  )
}

function PlayerMissing({ p }: { p:MissingPlayer }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
      <span style={{ fontSize:9, fontWeight:700, color:'#ff4545', background:'rgba(255,69,69,0.15)', padding:'2px 6px', borderRadius:4, textTransform:'uppercase', flexShrink:0 }}>{p.type.slice(0,3)}</span>
      <span style={{ fontSize:12, color:'#e8f4fd' }}>{p.player?.name}</span>
      {p.player?.position && <span style={{ fontSize:9, color:'#4a6fa5', marginLeft:'auto', flexShrink:0 }}>{p.player.position}</span>}
    </div>
  )
}

function StandingRow({ name, s, color }: { name:string; s:StandingEntry|null; color:string }) {
  if (!s) return null
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, fontSize:12 }}>
      <span style={{ width:20, height:20, borderRadius:6, background:color+'22', border:`1px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color, flexShrink:0 }}>#{s.rank}</span>
      <span style={{ flex:1, color:'#e8f4fd', fontWeight:600 }}>{name}</span>
      <span style={{ color:'#4a6fa5', fontSize:11 }}>{s.played}G</span>
      <span style={{ color:'#00ff87' }}>{s.win}W</span>
      <span style={{ color:'#ffd700' }}>{s.draw}D</span>
      <span style={{ color:'#ff4545' }}>{s.loss}L</span>
      <span style={{ color:s.goals_diff>=0?'#00ff87':'#ff4545', fontWeight:700 }}>{s.goals_diff>=0?'+':''}{s.goals_diff}</span>
      <span style={{ color:'#e8f4fd', fontWeight:800, minWidth:28, textAlign:'right' }}>{s.points}pts</span>
    </div>
  )
}

// ============================
// Prediction Tab — auto-generates on load
// ============================
function PredictionTab({ matchId, homeId, awayId, seasonId, homeTeam, awayTeam, scheduled }:
  { matchId:string; homeId:string; awayId:string; seasonId:string; homeTeam:string; awayTeam:string; scheduled:string }) {
  const [pred, setPred]       = useState<Record<string,unknown>|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [generated, setGenerated] = useState(false)

  // Check for stored prediction first, then auto-generate
  useEffect(() => {
    fetch(`/api/predictions?matchId=${encodeURIComponent(matchId)}`)
      .then(r=>r.json())
      .then(d => {
        const existing = (d.predictions as Array<Record<string,unknown>>)?.[0]
        if (existing) {
          setPred(existing)
        } else if (homeId && awayId && seasonId && !generated) {
          // Auto-generate
          setGenerated(true)
          generate()
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId])

  const generate = async () => {
    if (!homeId || !awayId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ matchId, homeTeamId:homeId, awayTeamId:awayId, seasonId, scheduled }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setPred(data)
    } catch(e) { setError(String(e)) } finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ textAlign:'center', padding:'24px', color:'#00ff87', fontSize:13, fontWeight:600 }}>⚡ Running 10-layer prediction engine…</div>
      <LoadingBlock /><LoadingBlock />
    </div>
  )

  if (!pred) return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'24px', textAlign:'center' }}>
      {error && <p style={{ color:'#ff4545', fontSize:12, marginBottom:12 }}>{error}</p>}
      <button onClick={generate} style={{ padding:'12px 28px', borderRadius:12, background:'rgba(0,255,135,0.12)', border:'1px solid rgba(0,255,135,0.3)', color:'#00ff87', fontWeight:700, fontSize:14, cursor:'pointer' }}>⚡ Generate Prediction</button>
      <p style={{ fontSize:11, color:'#4a6fa5', marginTop:10 }}>Runs all 10 layers: form, H2H, squad, xG, probabilities, home advantage & more</p>
    </div>
  )

  const hp   = Number(pred.home_win_prob??0)
  const dp   = Number(pred.draw_prob??0)
  const ap   = Number(pred.away_win_prob??0)
  const conf = Math.round(Number(pred.confidence??0)*100)
  const vol  = String(pred.volatility??'')
  const VOL_C: Record<string,string> = { LOW:'#00ff87', MEDIUM:'#ffd700', HIGH:'#ff9500', CHAOTIC:'#ff4545' }
  const outcome = String(pred.predicted_outcome??'')
  const OUTCOME_C: Record<string,string> = { home:'#00ff87', draw:'#ffd700', away:'#00b4d8' }
  const OUTCOME_L: Record<string,string> = { home:`${homeTeam} Win`, draw:'Draw', away:`${awayTeam} Win` }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Predicted outcome banner */}
      <div style={{ padding:'14px 16px', borderRadius:14, background:`${OUTCOME_C[outcome]??'#4a6fa5'}18`, border:`1px solid ${OUTCOME_C[outcome]??'#4a6fa5'}44`, textAlign:'center' }}>
        <p style={{ fontSize:11, color:'#4a6fa5', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Predicted Outcome</p>
        <p style={{ fontSize:22, fontWeight:800, color:OUTCOME_C[outcome]??'#e8f4fd' }}>{OUTCOME_L[outcome]??outcome}</p>
      </div>

      <Section title="Win Probabilities">
        <ProbabilityBar home={hp} draw={dp} away={ap} size="lg" showLabels />
      </Section>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        {([['Confidence',`${conf}%`,conf>65?'#00ff87':conf>40?'#ffd700':'#ff4545'],['Volatility',vol,VOL_C[vol]??'#8bafc7'],['Upset Risk',`${Math.round(Number(pred.upset_risk??0)*100)}%`,'#8bafc7']] as [string,string,string][]).map(([l,v,c])=>(
          <div key={l} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
            <p style={{ fontSize:9, color:'#4a6fa5', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{l}</p>
            <p style={{ fontSize:16, fontWeight:800, color:c }}>{v}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <Section title="Expected Goals">
          <div style={{ display:'flex', justifyContent:'space-around', paddingTop:4 }}>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:24, fontWeight:800, color:'#00ff87' }}>{Number(pred.expected_goals_home??0).toFixed(2)}</p>
              <p style={{ fontSize:10, color:'#4a6fa5' }}>{homeTeam.split(' ').slice(-1)[0]}</p>
            </div>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:24, fontWeight:800, color:'#00b4d8' }}>{Number(pred.expected_goals_away??0).toFixed(2)}</p>
              <p style={{ fontSize:10, color:'#4a6fa5' }}>{awayTeam.split(' ').slice(-1)[0]}</p>
            </div>
          </div>
        </Section>
        <Section title="Goals Market">
          {([['O/1.5', Number(pred.over_15_prob??0)],['O/2.5', Number(pred.over_25_prob??0)],['O/3.5', Number(pred.over_35_prob??0)],['BTTS', Number(pred.btts_prob??0)]] as [string,number][]).map(([l,p])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:12, color:'#8bafc7' }}>{l}</span>
              <span style={{ fontSize:12, fontWeight:800, color:p>0.6?'#00ff87':p>0.4?'#ffd700':'#ff4545' }}>{Math.round(p*100)}%</span>
            </div>
          ))}
        </Section>
      </div>

      {Array.isArray(pred.signals) && (pred.signals as Array<Record<string,unknown>>).length > 0 && (
        <Section title={`Signal Breakdown (${(pred.signals as unknown[]).length} signals)`}>
          {(pred.signals as Array<Record<string,unknown>>).slice(0,10).map((s,i)=>(
            <div key={i} style={{ display:'flex', gap:8, marginBottom:7 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:s.direction==='home'?'#00ff87':s.direction==='away'?'#00b4d8':'#4a6fa5', flexShrink:0, marginTop:4 }} />
              <div>
                <span style={{ fontSize:11, color:'#4a6fa5', fontWeight:600 }}>{String(s.layer??'')}: </span>
                <span style={{ fontSize:11, color:'#8bafc7' }}>{String(s.signal??'')}</span>
              </div>
            </div>
          ))}
        </Section>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#1e3a5f', padding:'0 4px' }}>
        <span>Data completeness: {Math.round(Number(pred.data_completeness??0)*100)}%</span>
        <span>Model v{String(pred.model_version??'')}</span>
        <button onClick={generate} style={{ background:'none', border:'none', color:'#4a6fa5', cursor:'pointer', fontSize:10 }}>Regenerate</button>
      </div>
    </div>
  )
}

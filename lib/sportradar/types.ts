/**
 * Sportradar Soccer v4 — core TypeScript types
 */

export interface Competitor {
  id: string
  name: string
  abbreviation: string
  short_name?: string
  country?: string
  country_code?: string
  gender?: string
}

export interface Venue {
  id: string
  name: string
  city?: string
  country?: string
  country_code?: string
  capacity?: number
  map_coordinates?: string
}

export interface SportEventConditions {
  attendance?: { count: number }
  ground?: { neutral: boolean }
  referees?: Referee[]
  weather?: { overall: string }
}

export interface Referee {
  id: string
  name: string
  type: string
  nationality?: string
}

export interface Coverage {
  live:        boolean
  lineups:     boolean
  trackers:    boolean
  scores:      boolean
  commentary:  boolean
  basic_play_by_play: boolean
  basic_player_stats: boolean
  advanced_player_stats: boolean
}

export interface SportEvent {
  id: string
  scheduled: string
  start_time_tbd?: boolean
  status?: string
  tournament_round?: { type: string; name?: string; number?: number }
  season?: { id: string; name: string; year: string; start_date: string; end_date: string; competition_id: string }
  tournament?: { id: string; name: string; season_id?: string }
  competitors: Array<{ id: string; name: string; abbreviation: string; qualifier: 'home' | 'away'; virtual?: boolean }>
  venue?: Venue
  sport_event_context?: {
    season:     { id: string; name: string; year: string; competition_id: string }
    stage?:     { order: number; type: string; phase: string; start_date: string; end_date: string; year: string }
    round?:     { number: number }
    competition: { id: string; name: string; gender: string }
    category:    { id: string; name: string; country_code?: string }
  }
  sport_event_conditions?: SportEventConditions
  coverage?: Coverage
}

export interface MatchScore {
  home_score:       number
  away_score:       number
  match_status:     string
  winner_id?:       string
  aggregate_home_score?: number
  aggregate_away_score?: number
  period_scores?: Array<{ home_score: number; away_score: number; type: string; number: number }>
}

export interface MatchStatistics {
  totals?: {
    competitors: Array<{
      id: string
      name: string
      qualifier: 'home' | 'away'
      statistics: TeamMatchStats
    }>
  }
  periods?: Array<{
    period_score?: { number: number; type: string }
    competitors: Array<{ id: string; qualifier: 'home' | 'away'; statistics: TeamMatchStats }>
  }>
}

export interface TeamMatchStats {
  ball_possession?:     number
  cards_given?:         number
  corner_kicks?:        number
  fouls?:               number
  free_kicks?:          number
  goal_kicks?:          number
  injuries?:            number
  offsides?:            number
  red_cards?:           number
  shots_blocked?:       number
  shots_off_target?:    number
  shots_on_target?:     number
  shots_saved?:         number
  shots_total?:         number
  substitutions?:       number
  throw_ins?:           number
  yellow_cards?:        number
  yellow_red_cards?:    number
}

export interface TimelineEvent {
  id:           number
  type:         string
  time:         number
  period?:      number
  period_type?: string
  match_clock?: string
  competitor?:  string
  x?:           number
  y?:           number
  outcome?:     string
  description?: string
  players?: Array<{ id: string; name: string; type: string }>
  assist1?: { id: string; name: string }
  home_score?: number
  away_score?: number
}

export interface Probability {
  home_team_winner: number
  away_team_winner: number
  draw:             number
}

export interface SportEventSummary {
  sport_event:            SportEvent
  sport_event_status:     MatchScore
  statistics?:            MatchStatistics
  sport_event_conditions?: SportEventConditions
}

export interface Player {
  id:           string
  name:         string
  date_of_birth?: string
  nationality?:   string
  country_code?:  string
  height?:        number
  weight?:        number
  jersey_number?: number
  position?:      string
  starter?:       boolean
  played?:        boolean
}

export interface LineupCompetitor {
  id:       string
  name:     string
  qualifier: 'home' | 'away'
  formation?: string
  manager?:   { id: string; name: string; nationality?: string; country_code?: string }
  players:    Player[]
}

// ─────────────────────────────────────────────────────────
// Response wrapper types
// ─────────────────────────────────────────────────────────

export interface CompetitionsResponse   { competitions: Array<{ id: string; name: string; gender?: string; category?: { id: string; name: string; country_code?: string } }> }
export interface CompetitionInfoResponse { competition: { id: string; name: string; gender?: string; category?: { id: string; name: string; country_code?: string } }; seasons?: Array<{ id: string; name: string; year: string; competition_id: string }> }
export interface DailyScheduleResponse  { schedule: SportEvent[] }
export interface DailySummariesResponse { summaries: Array<{ sport_event: SportEvent; sport_event_status: MatchScore; statistics?: MatchStatistics }> }
export interface LiveScheduleResponse   { schedules: Array<{ sport_event: SportEvent; sport_event_status: MatchScore }> }
export interface LiveSummariesResponse  { summaries: Array<{ sport_event: SportEvent; sport_event_status: MatchScore; statistics?: MatchStatistics }> }
export interface LiveTimelineDeltaResponse { schedules: Array<{ sport_event: SportEvent; sport_event_status: MatchScore; timeline: TimelineEvent[] }> }
export interface SportEventSummaryResponse { sport_event: SportEvent; sport_event_status: MatchScore; statistics?: MatchStatistics }
export interface SportEventTimelineResponse { sport_event: SportEvent; sport_event_status: MatchScore; statistics?: MatchStatistics; timeline: TimelineEvent[] }
export interface SportEventLineupsResponse { sport_event: SportEvent; lineups: LineupCompetitor[] }
export interface SportEventProbabilitiesResponse { sport_event: SportEvent; probabilities: { markets: Array<{ name: string; next_active_at?: string; outcomes: Array<{ market_name: string; name: string; probability: number }> }> } }
export interface SportEventFunFactsResponse { sport_event: SportEvent; facts: Array<{ statement: string }> }
export interface TimelineProbabilitiesResponse { sport_event: SportEvent; sport_event_status: MatchScore; statistics?: MatchStatistics; timeline: Array<TimelineEvent & { probabilities?: Probability }> }
export interface LiveProbabilitiesResponse { schedules: Array<{ sport_event: SportEvent; probabilities?: { markets: Array<{ name: string; outcomes: Array<{ name: string; probability: number }> }> } }> }
export interface SeasonStandingsResponse { season: { id: string; name: string }; standings: Array<{ name: string; type: string; groups: Array<{ name?: string; standings: Array<{ rank: number; played: number; win: number; loss: number; draw: number; goals_diff: number; points: number; competitor: Competitor; form?: string }> }> }> }
export interface SeasonScheduleResponse  { schedules: Array<{ sport_event: SportEvent; sport_event_status: MatchScore }> }
export interface SeasonSummariesResponse { summaries: Array<{ sport_event: SportEvent; sport_event_status: MatchScore; statistics?: MatchStatistics }> }
export interface SeasonLeadersResponse   { season: { id: string; name: string }; leaders: Array<{ name: string; competitors: Array<{ rank: number; competitor: Competitor; players: Array<{ player: Player; value: number; rank: number }> }> }> }
export interface SeasonMissingPlayersResponse { season: { id: string }; missing_players: Array<{ competitor: Competitor; players: Array<{ player: Player; type: string; reason?: string; start_date?: string; end_date?: string }> }> }
export interface SeasonOverUnderResponse { season: { id: string }; over_under_statistics: Array<{ competitor: Competitor; totals: Record<string, { over: number; under: number; total: number }> }> }
export interface SeasonCompetitorStatsResponse { season: { id: string }; competitor: Competitor; statistics: { totals: { competitors: Array<{ qualifier: 'home'|'away'; statistics: TeamMatchStats & Record<string, number> }> } } }
export interface CompetitorProfileResponse { competitor: Competitor & { venue?: Venue; manager?: { id: string; name: string }; players: Player[] } }
export interface CompetitorSchedulesResponse { schedules: Array<{ sport_event: SportEvent; sport_event_status: MatchScore }> }
export interface CompetitorSummariesResponse { summaries: Array<{ sport_event: SportEvent; sport_event_status: MatchScore; statistics?: MatchStatistics }> }
export interface CompetitorVsCompetitorResponse { last_meetings: { results: Array<{ sport_event: SportEvent; sport_event_status: MatchScore; statistics?: MatchStatistics }> }; next_meetings?: { schedule: SportEvent[] } }
export interface PlayerProfileResponse   { player: Player & { competitors?: Array<{ id: string; name: string; team_season?: { start_date: string; end_date?: string } }> } }
export interface SeasonTransfersResponse { season: { id: string }; transfers: Array<{ player: Player; start_date: string; type: string; from_competitor?: Competitor; to_competitor?: Competitor }> }

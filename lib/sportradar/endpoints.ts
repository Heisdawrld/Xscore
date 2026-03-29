/**
 * Sportradar Soccer v4 — all endpoint builders
 * Each function returns a typed API call via sportradarFetch.
 */

import { sportradarFetch } from './client'
import type {
  CompetitionsResponse,
  CompetitionInfoResponse,
  SeasonStandingsResponse,
  SeasonScheduleResponse,
  SeasonSummariesResponse,
  SeasonLeadersResponse,
  SeasonMissingPlayersResponse,
  SeasonOverUnderResponse,
  SeasonCompetitorStatsResponse,
  DailyScheduleResponse,
  DailySummariesResponse,
  LiveScheduleResponse,
  LiveSummariesResponse,
  LiveTimelineDeltaResponse,
  SportEventSummaryResponse,
  SportEventTimelineResponse,
  SportEventLineupsResponse,
  SportEventProbabilitiesResponse,
  SportEventFunFactsResponse,
  CompetitorProfileResponse,
  CompetitorSchedulesResponse,
  CompetitorSummariesResponse,
  CompetitorVsCompetitorResponse,
  PlayerProfileResponse,
  SeasonTransfersResponse,
  TimelineProbabilitiesResponse,
  LiveProbabilitiesResponse,
} from './types'

// ─ Competitions
export const getCompetitions = () =>
  sportradarFetch<CompetitionsResponse>('/competitions.json', { ttl: 'competitions' })

export const getCompetitionInfo = (competitionId: string) =>
  sportradarFetch<CompetitionInfoResponse>(`/competitions/${competitionId}/info.json`, { ttl: 'season' })

// ─ Daily
export const getDailySchedule = (date: string) =>
  sportradarFetch<DailyScheduleResponse>(`/schedules/${date}/schedule.json`, { ttl: 'daily' })

export const getDailySummaries = (date: string) =>
  sportradarFetch<DailySummariesResponse>(`/schedules/${date}/summaries.json`, { ttl: 'daily' })

// ─ Live
export const getLiveSchedule = () =>
  sportradarFetch<LiveScheduleResponse>('/schedules/live/schedule.json', { ttl: 'live' })

export const getLiveSummaries = () =>
  sportradarFetch<LiveSummariesResponse>('/schedules/live/summaries.json', { ttl: 'live' })

export const getLiveTimelineDelta = () =>
  sportradarFetch<LiveTimelineDeltaResponse>('/schedules/live/timelines/delta.json', { ttl: 'timeline' })

// ─ Sport Events
export const getSportEventSummary = (eventId: string) =>
  sportradarFetch<SportEventSummaryResponse>(`/sport_events/${eventId}/summary.json`, { ttl: 'live' })

export const getSportEventTimeline = (eventId: string) =>
  sportradarFetch<SportEventTimelineResponse>(`/sport_events/${eventId}/timeline.json`, { ttl: 'live' })

export const getSportEventLineups = (eventId: string) =>
  sportradarFetch<SportEventLineupsResponse>(`/sport_events/${eventId}/lineups.json`, { ttl: 'daily' })

export const getSportEventProbabilities = (eventId: string) =>
  sportradarFetch<SportEventProbabilitiesResponse>(`/sport_events/${eventId}/probabilities.json`, { ttl: 'probabilities' })

export const getSportEventFunFacts = (eventId: string) =>
  sportradarFetch<SportEventFunFactsResponse>(`/sport_events/${eventId}/fun_facts.json`, { ttl: 'daily' })

export const getTimelineProbabilities = (eventId: string) =>
  sportradarFetch<TimelineProbabilitiesResponse>(`/sport_events/${eventId}/timeline_probabilities.json`, { ttl: 'live' })

// ─ Live Probabilities
export const getLiveProbabilities = () =>
  sportradarFetch<LiveProbabilitiesResponse>('/schedules/live/probabilities.json', { ttl: 'live' })

// ─ Seasons
export const getSeasonStandings = (seasonId: string) =>
  sportradarFetch<SeasonStandingsResponse>(`/seasons/${seasonId}/standings.json`, { ttl: 'standings' })

export const getSeasonSchedule = (seasonId: string) =>
  sportradarFetch<SeasonScheduleResponse>(`/seasons/${seasonId}/schedule.json`, { ttl: 'season' })

export const getSeasonSummaries = (seasonId: string) =>
  sportradarFetch<SeasonSummariesResponse>(`/seasons/${seasonId}/summaries.json`, { ttl: 'season' })

export const getSeasonLeaders = (seasonId: string) =>
  sportradarFetch<SeasonLeadersResponse>(`/seasons/${seasonId}/leaders.json`, { ttl: 'season' })

export const getSeasonMissingPlayers = (seasonId: string) =>
  sportradarFetch<SeasonMissingPlayersResponse>(`/seasons/${seasonId}/missing_players.json`, { ttl: 'daily' })

export const getSeasonOverUnder = (seasonId: string) =>
  sportradarFetch<SeasonOverUnderResponse>(`/seasons/${seasonId}/over_under_statistics.json`, { ttl: 'standings' })

export const getSeasonalCompetitorStats = (seasonId: string, competitorId: string) =>
  sportradarFetch<SeasonCompetitorStatsResponse>(`/seasons/${seasonId}/competitors/${competitorId}/statistics.json`, { ttl: 'standings' })

export const getSeasonTransfers = (seasonId: string) =>
  sportradarFetch<SeasonTransfersResponse>(`/seasons/${seasonId}/transfers.json`, { ttl: 'daily' })

// ─ Competitors
export const getCompetitorProfile = (competitorId: string) =>
  sportradarFetch<CompetitorProfileResponse>(`/competitors/${competitorId}/profile.json`, { ttl: 'competitor' })

export const getCompetitorSchedules = (competitorId: string) =>
  sportradarFetch<CompetitorSchedulesResponse>(`/competitors/${competitorId}/schedules.json`, { ttl: 'competitor' })

export const getCompetitorSummaries = (competitorId: string) =>
  sportradarFetch<CompetitorSummariesResponse>(`/competitors/${competitorId}/summaries.json`, { ttl: 'competitor' })

export const getCompetitorVsCompetitor = (competitorId1: string, competitorId2: string) =>
  sportradarFetch<CompetitorVsCompetitorResponse>(`/competitors/${competitorId1}/versus/${competitorId2}/matches.json`, { ttl: 'competitor' })

// ─ Players
export const getPlayerProfile = (playerId: string) =>
  sportradarFetch<PlayerProfileResponse>(`/players/${playerId}/profile.json`, { ttl: 'player' })

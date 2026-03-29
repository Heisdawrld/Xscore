export type Outcome = 'home' | 'draw' | 'away'
export type Volatility = 'LOW' | 'MEDIUM' | 'HIGH' | 'CHAOTIC'

export interface Signal {
  layer:     string
  signal:    string
  direction: Outcome | 'neutral'
  strength:  number  // 0-1
}

export interface LayerOutput {
  home_win_prob: number
  draw_prob:     number
  away_win_prob: number
  confidence:    number   // 0-1, how much data this layer had
  signals:       Signal[]
}

export interface GoalsOutput {
  expected_goals_home: number
  expected_goals_away: number
  over_15_prob:        number
  over_25_prob:        number
  over_35_prob:        number
  btts_prob:           number
}

export interface PredictionResult {
  match_id:            string
  home_team:           string
  away_team:           string
  home_team_id:        string
  away_team_id:        string
  scheduled:           string
  competition_id?:     string
  generated_at:        string

  // 1X2
  home_win_prob:       number
  draw_prob:           number
  away_win_prob:       number
  predicted_outcome:   Outcome

  // Goals
  expected_goals_home: number
  expected_goals_away: number
  over_15_prob:        number
  over_25_prob:        number
  over_35_prob:        number
  btts_prob:           number

  // Confidence
  confidence_score:    number   // 0-100
  volatility:          Volatility
  upset_risk:          number

  // Explainability
  signals:             Signal[]

  // Meta
  data_completeness:   number   // 0-1
  model_version:       string
}

export interface MatchContext {
  matchId:         string
  homeTeamId:      string
  awayTeamId:      string
  seasonId:        string
  competitionId?:  string
  scheduled:       string
}

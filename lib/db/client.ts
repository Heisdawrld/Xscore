import { createClient, type Client } from '@libsql/client'

let _db: Client | null = null

export async function getDb(): Promise<Client> {
  if (_db) return _db

  _db = createClient({
    url:       process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })

  // Run migrations on first connection
  await runMigrations(_db)

  return _db
}

async function runMigrations(db: Client) {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS api_cache (
      key          TEXT    PRIMARY KEY,
      data         TEXT    NOT NULL,
      fetched_at   INTEGER NOT NULL,
      ttl_seconds  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id               TEXT    PRIMARY KEY,
      match_id         TEXT    NOT NULL,
      home_team        TEXT,
      away_team        TEXT,
      home_team_id     TEXT,
      away_team_id     TEXT,
      scheduled        TEXT,
      competition_id   TEXT,
      predicted_outcome TEXT,
      confidence       REAL,
      home_win_prob    REAL,
      draw_prob        REAL,
      away_win_prob    REAL,
      expected_goals_home REAL,
      expected_goals_away REAL,
      over_15_prob     REAL,
      over_25_prob     REAL,
      over_35_prob     REAL,
      btts_prob        REAL,
      volatility       TEXT,
      upset_risk       REAL,
      signals          TEXT,
      data_completeness REAL,
      model_version    TEXT,
      created_at       INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prediction_results (
      id               TEXT    PRIMARY KEY,
      prediction_id    TEXT    NOT NULL,
      actual_outcome   TEXT,
      actual_goals_home INTEGER,
      actual_goals_away INTEGER,
      was_correct      INTEGER,
      brier_score      REAL,
      resolved_at      INTEGER
    );

    CREATE TABLE IF NOT EXISTS saved_matches (
      id         TEXT    PRIMARY KEY,
      match_id   TEXT    NOT NULL,
      session_id TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS watched_competitions (
      id               TEXT PRIMARY KEY,
      competition_id   TEXT NOT NULL,
      competition_name TEXT,
      session_id       TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_predictions_match_id  ON predictions(match_id);
    CREATE INDEX IF NOT EXISTS idx_predictions_created   ON predictions(created_at);
    CREATE INDEX IF NOT EXISTS idx_cache_key             ON api_cache(key);
  `)
}

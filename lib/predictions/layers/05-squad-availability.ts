import { getSeasonMissingPlayers, getSeasonLeaders } from '@/lib/sportradar/endpoints'
import type { Signal } from '../types'

const POSITION_IMPACT: Record<string, number> = {
  goalkeeper: 0.30,
  G:          0.30,
  defender:   0.10,
  D:          0.10,
  midfielder: 0.12,
  M:          0.12,
  forward:    0.18,
  F:          0.18,
}

export interface SquadPenalty {
  homePenalty: number   // 0-1
  awayPenalty: number
  signals:     Signal[]
}

export async function squadAvailabilityLayer(
  homeTeamId: string,
  awayTeamId: string,
  seasonId: string,
): Promise<SquadPenalty> {
  try {
    const [missingRes, leadersRes] = await Promise.all([
      getSeasonMissingPlayers(seasonId),
      getSeasonLeaders(seasonId),
    ])

    // Build set of top scorer/assister IDs
    const keyPlayerIds = new Set<string>()
    for (const category of leadersRes.leaders ?? []) {
      for (const comp of category.competitors ?? []) {
        for (const entry of comp.players?.slice(0, 5) ?? []) {
          if (entry.player?.id) keyPlayerIds.add(entry.player.id)
        }
      }
    }

    const homeMissing = missingRes.missing_players?.find(c => c.competitor.id === homeTeamId)
    const awayMissing = missingRes.missing_players?.find(c => c.competitor.id === awayTeamId)

    const computePenalty = (missingList: typeof homeMissing) => {
      if (!missingList?.players?.length) return 0
      let penalty = 0
      for (const entry of missingList.players) {
        const pos    = entry.player?.position ?? ''
        const impact = POSITION_IMPACT[pos] ?? 0.08
        const boost  = keyPlayerIds.has(entry.player?.id ?? '') ? 1.5 : 1.0
        penalty += impact * boost
      }
      return Math.min(0.6, penalty)  // cap at 60% impact
    }

    const homePenalty = computePenalty(homeMissing)
    const awayPenalty = computePenalty(awayMissing)

    const signals: Signal[] = []
    if (homePenalty > 0.1)
      signals.push({ layer: 'Squad Availability', signal: `Home missing ${homeMissing?.players?.length ?? 0} players (penalty ${(homePenalty*100).toFixed(0)}%)`, direction: 'away', strength: homePenalty })
    if (awayPenalty > 0.1)
      signals.push({ layer: 'Squad Availability', signal: `Away missing ${awayMissing?.players?.length ?? 0} players (penalty ${(awayPenalty*100).toFixed(0)}%)`, direction: 'home', strength: awayPenalty })
    if (homePenalty === 0 && awayPenalty === 0)
      signals.push({ layer: 'Squad Availability', signal: 'Both teams at full strength', direction: 'neutral', strength: 0 })

    return { homePenalty, awayPenalty, signals }
  } catch {
    return { homePenalty: 0, awayPenalty: 0, signals: [] }
  }
}

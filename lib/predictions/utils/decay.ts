/**
 * Recency decay utilities
 * Recent events matter more than old ones.
 */

const DECAY = 0.85  // per-match decay factor

// Apply exponential decay to an array of values (index 0 = most recent)
export function decayWeightedAvg(values: number[]): number {
  if (values.length === 0) return 0
  let numerator = 0
  let denominator = 0
  values.forEach((v, i) => {
    const w = Math.pow(DECAY, i)
    numerator   += v * w
    denominator += w
  })
  return denominator === 0 ? 0 : numerator / denominator
}

// W=1.0 D=0.4 L=0.0
export function resultToScore(result: 'W' | 'D' | 'L' | string): number {
  if (result === 'W') return 1.0
  if (result === 'D') return 0.4
  return 0.0
}

// Compute form score from array of results (most recent first)
export function formScore(results: string[]): number {
  return decayWeightedAvg(results.map(resultToScore))
}

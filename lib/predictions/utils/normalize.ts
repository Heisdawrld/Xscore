export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v))
}

export function softmax(values: number[]): number[] {
  const max = Math.max(...values)
  const exps = values.map(v => Math.exp(v - max))
  const sum  = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

// Weighted blend of multiple probability triplets
export function blendProbabilities(
  layers: Array<{ home: number; draw: number; away: number; weight: number }>
): { home: number; draw: number; away: number } {
  let home = 0, draw = 0, away = 0, totalWeight = 0
  for (const l of layers) {
    home  += l.home  * l.weight
    draw  += l.draw  * l.weight
    away  += l.away  * l.weight
    totalWeight += l.weight
  }
  if (totalWeight === 0) return { home: 1/3, draw: 1/3, away: 1/3 }
  return { home: home/totalWeight, draw: draw/totalWeight, away: away/totalWeight }
}

// Shannon entropy (normalized 0-1)
export function normalizedEntropy(probs: number[]): number {
  const n = probs.length
  if (n <= 1) return 0
  let entropy = 0
  for (const p of probs) {
    if (p > 0) entropy -= p * Math.log(p)
  }
  return entropy / Math.log(n)
}

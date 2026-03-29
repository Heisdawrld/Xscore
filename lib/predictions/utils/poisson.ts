/**
 * Poisson distribution utilities with Dixon-Coles correction
 */

// Poisson PMF: P(X = k) given mean lambda
export function poissonPMF(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k)
}

// Poisson CDF: P(X <= k)
export function poissonCDF(lambda: number, k: number): number {
  let sum = 0
  for (let i = 0; i <= k; i++) sum += poissonPMF(lambda, i)
  return Math.min(1, sum)
}

function factorial(n: number): number {
  if (n <= 1) return 1
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

// Dixon-Coles tau correction for low-score cells
// Corrects the joint Poisson for (0,0), (1,0), (0,1), (1,1)
export function dixonColesTau(
  homeGoals: number,
  awayGoals: number,
  lambdaHome: number,
  lambdaAway: number,
  rho: number = -0.13,  // standard calibrated value
): number {
  if (homeGoals === 0 && awayGoals === 0) return 1 - lambdaHome * lambdaAway * rho
  if (homeGoals === 1 && awayGoals === 0) return 1 + lambdaAway * rho
  if (homeGoals === 0 && awayGoals === 1) return 1 + lambdaHome * rho
  if (homeGoals === 1 && awayGoals === 1) return 1 - rho
  return 1
}

// Full score probability matrix (0-6 x 0-6) with Dixon-Coles correction
export function scoreMatrix(
  lambdaHome: number,
  lambdaAway: number,
  maxGoals = 6,
): number[][] {
  const matrix: number[][] = []
  let total = 0

  for (let h = 0; h <= maxGoals; h++) {
    matrix[h] = []
    for (let a = 0; a <= maxGoals; a++) {
      const raw = poissonPMF(lambdaHome, h) * poissonPMF(lambdaAway, a)
      const tau = dixonColesTau(h, a, lambdaHome, lambdaAway)
      matrix[h][a] = raw * tau
      total += matrix[h][a]
    }
  }

  // Normalise to sum to 1
  for (let h = 0; h <= maxGoals; h++)
    for (let a = 0; a <= maxGoals; a++)
      matrix[h][a] /= total

  return matrix
}

// Collapse score matrix into 1X2 probabilities
export function matrixTo1X2(matrix: number[][]): { home: number; draw: number; away: number } {
  let home = 0, draw = 0, away = 0
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      const p = matrix[h][a]
      if (h > a) home += p
      else if (h === a) draw += p
      else away += p
    }
  }
  return { home, draw, away }
}

// Normalise a {home, draw, away} object to sum to 1
export function normalise(probs: { home: number; draw: number; away: number }) {
  const total = probs.home + probs.draw + probs.away
  if (total === 0) return { home: 1/3, draw: 1/3, away: 1/3 }
  return {
    home: probs.home / total,
    draw: probs.draw / total,
    away: probs.away / total,
  }
}

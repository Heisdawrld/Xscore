import { normalizedEntropy, clamp } from '../utils/normalize'
import type { LayerOutput, Signal, Volatility } from '../types'

export interface VarianceOutput {
  confidenceScore: number    // 0-100
  volatility:      Volatility
  upsetRisk:       number    // 0-1
  signals:         Signal[]
}

export function varianceUpsetLayer(
  layers: Array<LayerOutput | null>,
  varianceMultiplier: number,
): VarianceOutput {
  const validLayers = layers.filter(Boolean) as LayerOutput[]
  if (validLayers.length === 0) {
    return { confidenceScore: 0, volatility: 'CHAOTIC', upsetRisk: 0.5, signals: [] }
  }

  // Average the probabilities
  const avgHome = validLayers.reduce((s, l) => s + l.home_win_prob, 0) / validLayers.length
  const avgDraw = validLayers.reduce((s, l) => s + l.draw_prob,     0) / validLayers.length
  const avgAway = validLayers.reduce((s, l) => s + l.away_win_prob, 0) / validLayers.length

  // Entropy of the final distribution
  const entropy = normalizedEntropy([avgHome, avgDraw, avgAway])

  // Signal disagreement: std dev of home win probs across layers
  const homeProbs = validLayers.map(l => l.home_win_prob)
  const homeMean  = homeProbs.reduce((s, v) => s + v, 0) / homeProbs.length
  const homeStd   = Math.sqrt(homeProbs.reduce((s, v) => s + Math.pow(v - homeMean, 2), 0) / homeProbs.length)

  const rawConfidence = (1 - entropy) * (1 - homeStd * 2)
  const adjustedConf  = clamp(rawConfidence / varianceMultiplier)
  const confidenceScore = Math.round(adjustedConf * 100)

  // Volatility classification
  let volatility: Volatility
  if (confidenceScore >= 70)      volatility = 'LOW'
  else if (confidenceScore >= 50) volatility = 'MEDIUM'
  else if (confidenceScore >= 30) volatility = 'HIGH'
  else                             volatility = 'CHAOTIC'

  // Upset risk: probability that the lower-probability team wins
  const favorite   = Math.max(avgHome, avgAway)
  const underdog   = Math.min(avgHome, avgAway)
  const upsetRisk  = clamp(underdog / (favorite + 0.001))

  const signals: Signal[] = [
    { layer: 'Variance/Upset', signal: `Prediction entropy ${(entropy*100).toFixed(0)}%, signal disagreement ${(homeStd*100).toFixed(0)}%`, direction: 'neutral', strength: entropy },
    { layer: 'Variance/Upset', signal: `Upset risk: ${(upsetRisk*100).toFixed(0)}%`, direction: 'neutral', strength: upsetRisk },
  ]

  return { confidenceScore, volatility, upsetRisk, signals }
}

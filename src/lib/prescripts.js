export const DIFFICULTY_WEIGHTS_BY_RANK = Object.freeze({
  Proselyte: Object.freeze({ Easy: 0.7, Medium: 0.25, Hard: 0.05 }),
  Proxy: Object.freeze({ Easy: 0.4, Medium: 0.5, Hard: 0.1 }),
  'Grace of the Prescript': Object.freeze({ Easy: 0.05, Medium: 0.2, Hard: 0.75 }),
})

function pickWeightedDifficulty(weights) {
  const entries = Object.entries(weights)
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  if (total <= 0) return null

  let roll = Math.random() * total
  for (const [difficulty, weight] of entries) {
    roll -= weight
    if (roll <= 0) return difficulty
  }

  return entries[entries.length - 1][0]
}

/**
 * Pick a random prescript, avoiding excludeId when the pool allows.
 * Uses rank-based weighted difficulty selection when possible.
 * @param {Array<{id:string, difficulty:string}>} pool
 * @param {string|null} excludeId  id of the currently-displayed prescript
 * @param {string} rank current rank used for difficulty weighting
 * @returns {object|null}  a prescript, or null if pool is empty
 */
export function getRandomPresc(pool, excludeId = null, rank = 'Proselyte') {
  if (!Array.isArray(pool) || pool.length === 0) return null

  const candidates = pool.length > 1
    ? pool.filter((p) => p.id !== excludeId)
    : pool
  const source = candidates.length > 0 ? candidates : pool

  const rankWeights = DIFFICULTY_WEIGHTS_BY_RANK[rank] ?? DIFFICULTY_WEIGHTS_BY_RANK.Proselyte
  const availableWeights = Object.fromEntries(
    Object.entries(rankWeights).filter(([difficulty]) =>
      source.some((prescript) => prescript.difficulty === difficulty)
    )
  )

  const selectedDifficulty = pickWeightedDifficulty(availableWeights)
  const difficultyPool = selectedDifficulty
    ? source.filter((prescript) => prescript.difficulty === selectedDifficulty)
    : source

  const finalPool = difficultyPool.length > 0 ? difficultyPool : source
  return finalPool[Math.floor(Math.random() * finalPool.length)]
}

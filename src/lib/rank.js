// Ordered ladder. `threshold` = trust needed to promote FROM this rank.
// The final rank has threshold = Infinity (cannot promote further).
export const RANKS = Object.freeze([
  { name: 'Proselyte',          threshold: 150 },
  { name: 'Proxy',              threshold: 300 },
  { name: 'Grace of the Prescript', threshold: Infinity },
])

export const TRUST_AWARD = Object.freeze({ Easy: 1, Medium: 5, Hard: 10 })

/**
 * Pure promotion calc.
 * @param {number} accumulatedTrust  trust AFTER adding the latest award
 * @param {string} currentRank       current rank name
 * @returns {{ newRank: string, newTrust: number, promoted: boolean }}
 */
export function calculateRank(accumulatedTrust, currentRank) {
  const idx = RANKS.findIndex(r => r.name === currentRank)
  // Defensive: unknown rank → treat as first rank.
  const safeIdx = idx === -1 ? 0 : idx
  const { threshold } = RANKS[safeIdx]

  if (accumulatedTrust >= threshold && safeIdx < RANKS.length - 1) {
    return { newRank: RANKS[safeIdx + 1].name, newTrust: 0, promoted: true }
  }
  return { newRank: RANKS[safeIdx].name, newTrust: accumulatedTrust, promoted: false }
}

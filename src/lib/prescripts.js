/**
 * Pick a random prescript, avoiding excludeId when the pool allows.
 * @param {Array<{id:string}>} pool
 * @param {string|null} excludeId  id of the currently-displayed prescript
 * @returns {object|null}  a prescript, or null if pool is empty
 */
export function getRandomPresc(pool, excludeId = null) {
  if (!Array.isArray(pool) || pool.length === 0) return null
  const candidates = pool.length > 1
    ? pool.filter(p => p.id !== excludeId)
    : pool                      // size 1 → return the only entry even if excluded
  const source = candidates.length > 0 ? candidates : pool
  return source[Math.floor(Math.random() * source.length)]
}

/**
 * Shape validators for data read back from localStorage during hydration.
 *
 * These guards protect against corrupt storage entries that would cause
 * TypeError crashes (e.g. null.id) in downstream pool/history consumers.
 */

/**
 * Returns true when `p` is a plain object with all three required string fields.
 * @param {unknown} p
 * @returns {boolean}
 */
export function isValidPrescript(p) {
  return (
    typeof p === 'object' &&
    p !== null &&
    typeof p.id === 'string' &&
    typeof p.text === 'string' &&
    typeof p.difficulty === 'string'
  )
}

/**
 * Returns true when `e` is a plain object with the four required string fields
 * plus a numeric timestamp.
 * @param {unknown} e
 * @returns {boolean}
 */
export function isValidHistoryEntry(e) {
  return (
    typeof e === 'object' &&
    e !== null &&
    typeof e.id === 'string' &&
    typeof e.text === 'string' &&
    typeof e.difficulty === 'string' &&
    typeof e.outcome === 'string' &&
    typeof e.timestamp === 'number'
  )
}

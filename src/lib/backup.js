/**
 * Build the portable backup payload using only persisted state keys.
 * Intentionally excludes runtime-only values (for example activePrescript).
 */
export function buildBackupPayload(state) {
  const { currentRank, accumulatedTrust, history, customPrescripts, settings } = state
  return { currentRank, accumulatedTrust, history, customPrescripts, settings }
}

/**
 * Validate top-level backup structure.
 * Per-item cleanup for arrays is handled during rehydrate().
 */
export function validateBackup(parsed) {
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'Backup is not a valid object.' }
  }
  if (typeof parsed.currentRank !== 'string') {
    return { ok: false, error: 'Backup missing a valid currentRank.' }
  }
  if (typeof parsed.accumulatedTrust !== 'number') {
    return { ok: false, error: 'Backup missing a valid accumulatedTrust.' }
  }
  if (!Array.isArray(parsed.history)) {
    return { ok: false, error: 'Backup history must be an array.' }
  }
  if (!Array.isArray(parsed.customPrescripts)) {
    return { ok: false, error: 'Backup customPrescripts must be an array.' }
  }

  // `settings` is optional: rehydrate() merges storage values over defaults.
  return { ok: true, data: parsed }
}


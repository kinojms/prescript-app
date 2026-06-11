export const STORAGE_KEYS = Object.freeze({
  rank:    'index_prescript_rank',
  trust:   'index_prescript_trust',
  history: 'index_prescript_history',
  custom:  'index_prescript_custom_prescripts',
  settings:'index_prescript_settings',
})

/** Read+parse a key, returning fallback on missing/corrupt JSON. */
export function readKey(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

/** Serialize+write a key. Swallows quota/serialization errors. */
export function writeKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable or quota exceeded — ignore */
  }
}

import { useReducer, useEffect } from 'react'
import { STORAGE_KEYS, readKey, writeKey } from '../lib/storage.js'
import { TRUST_AWARD, calculateRank } from '../lib/rank.js'
import { getRandomPresc } from '../lib/prescripts.js'
import { DEFAULT_PRESCRIPTS } from '../data/defaultPrescripts.js'
import { isValidPrescript, isValidHistoryEntry } from '../lib/hydration.js'
import { buildBackupPayload, validateBackup } from '../lib/backup.js'

const DEFAULTS = {
  currentRank: 'Proselyte',
  accumulatedTrust: 0,
  history: [],
  customPrescripts: [],
  settings: {
    mode: 'dark',
    muted: false,
    bgmMuted: false,
    bgmVolume: 0.3,
    useDefault: true,
    useCustom: true,
    theme: 'default',
  },
}

const DAILY_PRESCRIPT_LIMIT = 10

function dayKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/**
 * Read all five keys from localStorage, returning a fully-typed state object.
 * Called as the useReducer lazy initializer so it runs once before first render
 * and avoids StrictMode double-mount stomping real data with defaults.
 */
function hydrate() {
  const currentRank = readKey(STORAGE_KEYS.rank, DEFAULTS.currentRank)
  const accumulatedTrust = readKey(STORAGE_KEYS.trust, DEFAULTS.accumulatedTrust)
  const history = readKey(STORAGE_KEYS.history, DEFAULTS.history)
  const customPrescripts = readKey(STORAGE_KEYS.custom, DEFAULTS.customPrescripts)
  const storedSettings = readKey(STORAGE_KEYS.settings, {})

  // Shallow-merge so newly added flags in later phases get typed defaults
  // even when an older settings blob is loaded.
  const settings = { ...DEFAULTS.settings, ...storedSettings }

  return {
    currentRank: typeof currentRank === 'string' ? currentRank : DEFAULTS.currentRank,
    accumulatedTrust: typeof accumulatedTrust === 'number' ? accumulatedTrust : DEFAULTS.accumulatedTrust,
    history: Array.isArray(history) ? history.filter(isValidHistoryEntry) : DEFAULTS.history,
    customPrescripts: Array.isArray(customPrescripts) ? customPrescripts.filter(isValidPrescript) : DEFAULTS.customPrescripts,
    settings,
  }
}

/**
 * Pure reducer — no side effects, no Date.now(), no random calls.
 * All impure values must be pre-computed and passed in the action payload.
 */
function reducer(state, action) {
  switch (action.type) {
    case 'act': {
      const { outcome, prescript, next, now } = action

      const award = outcome === 'success' ? (TRUST_AWARD[prescript.difficulty] ?? 0) : 0
      const trustAfter = state.accumulatedTrust + award
      const { newRank, newTrust } = calculateRank(trustAfter, state.currentRank)

      const entry = {
        id: `${prescript.id}-${now}`,
        prescriptId: prescript.id,
        text: prescript.text,
        difficulty: prescript.difficulty,
        outcome,
        timestamp: now,
      }

      return {
        ...state,
        currentRank: newRank,
        accumulatedTrust: newTrust,
        history: [entry, ...state.history],
        activePrescript: next,
      }
    }

    case 'rehydrate': {
      return { ...state, ...action.data }
    }

    case 'set-settings': {
      return { ...state, settings: { ...state.settings, ...action.patch } }
    }

    case 'add-custom': {
      return { ...state, customPrescripts: [...state.customPrescripts, action.prescript] }
    }

    case 'delete-custom': {
      return {
        ...state,
        customPrescripts: state.customPrescripts.filter((p) => p.id !== action.id),
      }
    }

    default:
      return state
  }
}

export function useAppState() {
  // Lazy initializer: hydrate() runs once at mount, reading from localStorage.
  // activePrescript is runtime state — not persisted, computed from the pool.
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const hydrated = hydrate()
    const pool = [
      ...(hydrated.settings.useDefault ? DEFAULT_PRESCRIPTS : []),
      ...(hydrated.settings.useCustom ? hydrated.customPrescripts : []),
    ]
    return { ...hydrated, activePrescript: getRandomPresc(pool, null) }
  })

  const { currentRank, accumulatedTrust, history, customPrescripts, settings, activePrescript } = state

  // Derive pool (re-computed on render so it stays current with settings)
  const pool = [
    ...(settings.useDefault ? DEFAULT_PRESCRIPTS : []),
    ...(settings.useCustom ? customPrescripts : []),
  ]

  // Persistence effects — each slice writes independently so only changed
  // slices get written. Effects only fire after the lazy init values, so no
  // stomp-defaults-on-load bug.
  useEffect(() => { writeKey(STORAGE_KEYS.rank, currentRank) }, [currentRank])
  useEffect(() => { writeKey(STORAGE_KEYS.trust, accumulatedTrust) }, [accumulatedTrust])
  useEffect(() => { writeKey(STORAGE_KEYS.history, history) }, [history])
  useEffect(() => { writeKey(STORAGE_KEYS.custom, customPrescripts) }, [customPrescripts])
  useEffect(() => { writeKey(STORAGE_KEYS.settings, settings) }, [settings])

  /**
   * Dispatch an action with pre-computed impure values so the reducer stays pure.
   * StrictMode double-invokes reducers in dev; keeping Date.now()/random here
   * ensures both invocations use the same seed value.
   */
  function act(outcome) {
    const p = activePrescript
    if (!p) return
    const now = Date.now()
    const today = dayKey(now)
    const todayCount = history.reduce((count, entry) => {
      if (typeof entry?.timestamp !== 'number' || !Number.isFinite(entry.timestamp)) return count
      return dayKey(entry.timestamp) === today ? count + 1 : count
    }, 0)
    if (todayCount >= DAILY_PRESCRIPT_LIMIT) return

    dispatch({
      type: 'act',
      outcome,
      prescript: p,
      next: getRandomPresc(pool, p.id),
      now,
    })
  }

  const execute = () => act('success')
  const diverge = () => act('fail')

  const setMode = (mode) => dispatch({ type: 'set-settings', patch: { mode } })
  const setMuted = (muted) => dispatch({ type: 'set-settings', patch: { muted } })
  const setBgmMuted = (bgmMuted) => dispatch({ type: 'set-settings', patch: { bgmMuted: !!bgmMuted } })
  const setBgmVolume = (bgmVolume) => {
    const next = Number(bgmVolume)
    const clamped = Number.isFinite(next) ? Math.max(0, Math.min(1, next)) : DEFAULTS.settings.bgmVolume
    dispatch({ type: 'set-settings', patch: { bgmVolume: clamped } })
  }
  const setSources = (useDefault, useCustom) => {
    dispatch({ type: 'set-settings', patch: { useDefault: !!useDefault, useCustom: !!useCustom } })
  }

  function addCustomPrescript(text, difficulty) {
    const trimmed = `${text ?? ''}`.trim()
    if (!trimmed) return
    const safeDifficulty = difficulty === 'Hard' ? 'Hard' : 'Easy'
    const id =
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? `custom-${crypto.randomUUID()}`
        : `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`

    dispatch({
      type: 'add-custom',
      prescript: { id, text: trimmed, difficulty: safeDifficulty },
    })
  }

  function deleteCustomPrescript(id) {
    dispatch({ type: 'delete-custom', id })
  }

  function exportBackup() {
    const payload = buildBackupPayload(state)
    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'index_prescript_backup.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function importBackup(file) {
    return new Promise((resolve) => {
      if (!file) {
        resolve({ ok: false, error: 'No file selected.' })
        return
      }

      const reader = new FileReader()
      reader.onerror = () => resolve({ ok: false, error: 'Could not read the file.' })
      reader.onload = () => {
        let parsed
        try {
          parsed = JSON.parse(reader.result)
        } catch {
          resolve({ ok: false, error: 'File is not valid JSON.' })
          return
        }

        const result = validateBackup(parsed)
        if (!result.ok) {
          resolve({ ok: false, error: result.error })
          return
        }

        const data = result.data
        writeKey(STORAGE_KEYS.rank, data.currentRank)
        writeKey(STORAGE_KEYS.trust, data.accumulatedTrust)
        writeKey(STORAGE_KEYS.history, data.history)
        writeKey(STORAGE_KEYS.custom, data.customPrescripts)
        if (data.settings !== undefined) {
          writeKey(STORAGE_KEYS.settings, data.settings)
        }

        rehydrate()
        resolve({ ok: true })
      }
      reader.readAsText(file)
    })
  }

  /**
   * Re-reads all keys from storage into state.
   * Phase 3 calls this after overwriting localStorage (e.g. on import).
   * Also re-picks activePrescript since the pool may have changed.
   */
  function rehydrate() {
    const data = hydrate()
    const rehydratedPool = [
      ...(data.settings.useDefault ? DEFAULT_PRESCRIPTS : []),
      ...(data.settings.useCustom ? data.customPrescripts : []),
    ]
    dispatch({
      type: 'rehydrate',
      data: { ...data, activePrescript: getRandomPresc(rehydratedPool, null) },
    })
  }

  return {
    // US-001
    currentRank,
    accumulatedTrust,
    // US-002
    activePrescript,
    execute,
    diverge,
    // US-003
    history,
    // later-phase seams (exposed now, UI added later)
    settings,
    setMode,
    setMuted,
    setBgmMuted,
    setBgmVolume,
    setSources,
    customPrescripts,
    addCustomPrescript,
    deleteCustomPrescript,
    exportBackup,
    importBackup,
    rehydrate,
  }
}

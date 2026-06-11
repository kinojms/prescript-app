import { useReducer, useEffect, useRef } from 'react'
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
    sfxVolume: 0.3,
    bgmMuted: false,
    bgmVolume: 0.3,
    useDefault: true,
    useCustom: true,
    theme: 'default',
  },
}

const DAILY_PRESCRIPT_LIMIT = 20
const VALID_DIFFICULTIES = new Set(['Easy', 'Medium', 'Hard'])
const TIME_SENSITIVE_DIFFICULTIES = new Set(['Medium', 'Hard'])
const TIME_SENSITIVE_DURATIONS_MS = [30 * 60 * 1000, 60 * 60 * 1000]
const TIME_SENSITIVE_CHANCE = 0.5
const TIMEOUT_DIVERGE_PENALTY = 5
const DISTORTION_BASE_FAIL_COUNT = 5
const DISTORTION_BASE_OPACITY = 0.3
const DISTORTION_OPACITY_STEP = 0.1
const DISTORTION_MAX_OPACITY = 0.9
const LIVE_DISTORTION_WARNING = 'Distortion Warning: Deviation levels critical. The Proxies have been dispatched.'

function dayKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function pickDeadlineDurationMs() {
  const index = Math.floor(Math.random() * TIME_SENSITIVE_DURATIONS_MS.length)
  return TIME_SENSITIVE_DURATIONS_MS[index]
}

function evaluateDay(entries) {
  const total = entries.length
  const executed = entries.filter((entry) => entry.outcome === 'success').length
  const diverged = entries.filter((entry) => entry.outcome === 'fail').length
  const ratio = total === 0 ? 0 : executed / total

  if (total > 0 && executed === total) {
    return {
      status: 'flawless',
      message: 'Flawless Execution - The Will is Absolute.',
      executed,
      diverged,
      total,
      ratio,
    }
  }

  if (ratio > 0.5 || total === 0) {
    return {
      status: 'stable',
      message: 'Status: Stable Proselyte/Proxy.',
      executed,
      diverged,
      total,
      ratio,
    }
  }

  return {
    status: 'distorting',
    message: 'Distortion Warning: Deviation levels critical. The Proxies have been dispatched.',
    executed,
    diverged,
    total,
    ratio,
  }
}

function computeDistortionOpacity(status, divergedCount) {
  if (status !== 'distorting') return 0
  if (divergedCount <= DISTORTION_BASE_FAIL_COUNT) return DISTORTION_BASE_OPACITY
  const steps = divergedCount - DISTORTION_BASE_FAIL_COUNT
  return Math.min(DISTORTION_MAX_OPACITY, DISTORTION_BASE_OPACITY + (steps * DISTORTION_OPACITY_STEP))
}

function countFailedEntriesForDay(history, day) {
  return history.reduce((count, entry) => {
    if (dayKey(entry.timestamp) !== day) return count
    return entry.outcome === 'fail' ? count + 1 : count
  }, 0)
}

function decoratePrescript(rawPrescript, now = Date.now()) {
  if (!rawPrescript) return null

  if (!TIME_SENSITIVE_DIFFICULTIES.has(rawPrescript.difficulty)) {
    return {
      ...rawPrescript,
      timeSensitive: false,
      deadlineAt: null,
      deadlineDurationMs: null,
    }
  }

  const shouldBeTimed = Math.random() < TIME_SENSITIVE_CHANCE
  if (!shouldBeTimed) {
    return {
      ...rawPrescript,
      timeSensitive: false,
      deadlineAt: null,
      deadlineDurationMs: null,
    }
  }

  const deadlineDurationMs = pickDeadlineDurationMs()
  return {
    ...rawPrescript,
    timeSensitive: true,
    deadlineDurationMs,
    deadlineAt: now + deadlineDurationMs,
  }
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
      const { outcome, prescript, next, now, penalty = 0, timeout = false } = action

      const award = outcome === 'success' ? (TRUST_AWARD[prescript.difficulty] ?? 0) : 0
      const trustAfter = Math.max(0, state.accumulatedTrust + award - penalty)
      const { newRank, newTrust } = calculateRank(trustAfter, state.currentRank)
      const actionDay = dayKey(now)
      const previousFailCount = countFailedEntriesForDay(state.history, actionDay)
      const nextFailCount = outcome === 'fail' ? previousFailCount + 1 : previousFailCount
      const crossedLiveDistortionThreshold =
        previousFailCount < DISTORTION_BASE_FAIL_COUNT &&
        nextFailCount >= DISTORTION_BASE_FAIL_COUNT
      const shouldGlitchForAdditionalDistortionStep =
        outcome === 'fail' && previousFailCount >= DISTORTION_BASE_FAIL_COUNT

      const entry = {
        id: `${prescript.id}-${now}`,
        prescriptId: prescript.id,
        text: prescript.text,
        difficulty: prescript.difficulty,
        outcome,
        timestamp: now,
        timeout,
      }

      return {
        ...state,
        currentRank: newRank,
        accumulatedTrust: newTrust,
        history: [entry, ...state.history],
        activePrescript: next,
        lastTimeoutAt: timeout ? now : state.lastTimeoutAt,
        lastDistortionGlitchAt:
          crossedLiveDistortionThreshold || shouldGlitchForAdditionalDistortionStep
            ? now
            : state.lastDistortionGlitchAt,
      }
    }

    case 'rehydrate': {
      return {
        ...state,
        ...action.data,
        lastTimeoutAt: state.lastTimeoutAt,
        lastDistortionGlitchAt: state.lastDistortionGlitchAt,
      }
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

    case 'conclude-day': {
      const dayEntries = state.history.filter((entry) => dayKey(entry.timestamp) === action.day)
      const evaluation = evaluateDay(dayEntries)
      const shouldGlitchOnConclude = evaluation.status === 'distorting'
      return {
        ...state,
        history: [],
        lastEvaluation: {
          ...evaluation,
          day: action.day,
          source: action.source,
          timestamp: action.now,
        },
        distortionOpacity: 0,
        lastDistortionGlitchAt: shouldGlitchOnConclude ? action.now : 0,
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
    return {
      ...hydrated,
      activePrescript: decoratePrescript(getRandomPresc(pool, null, hydrated.currentRank)),
      lastTimeoutAt: 0,
      lastDistortionGlitchAt: 0,
      lastEvaluation: null,
      distortionOpacity: 0,
    }
  })
  const timeoutHandledPrescriptRef = useRef(null)

  const { currentRank, accumulatedTrust, history, customPrescripts, settings, activePrescript } = state
  const today = dayKey(Date.now())
  const todayFailedCount = countFailedEntriesForDay(history, today)
  const liveDistorting = todayFailedCount >= DISTORTION_BASE_FAIL_COUNT
  const liveDistortionOpacity = liveDistorting
    ? computeDistortionOpacity('distorting', todayFailedCount)
    : 0
  const liveDistortion = {
    active: liveDistorting,
    failCount: todayFailedCount,
    message: LIVE_DISTORTION_WARNING,
    opacity: liveDistortionOpacity,
  }
  const effectiveDistortionOpacity = Math.max(state.distortionOpacity, liveDistortionOpacity)

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
    return actWithOptions(outcome)
  }

  function actWithOptions(outcome, options = {}) {
    const p = activePrescript
    if (!p) return
    if (options.timeout && !p.timeSensitive) return

    const now = Date.now()
    const today = dayKey(now)
    const todayCount = history.reduce((count, entry) => {
      if (typeof entry?.timestamp !== 'number' || !Number.isFinite(entry.timestamp)) return count
      return dayKey(entry.timestamp) === today ? count + 1 : count
    }, 0)
    if (todayCount >= DAILY_PRESCRIPT_LIMIT) return

    const award = outcome === 'success' ? (TRUST_AWARD[p.difficulty] ?? 0) : 0
    const penalty = Number.isFinite(options.penalty) ? Math.max(0, options.penalty) : 0
    const trustAfter = Math.max(0, accumulatedTrust + award - penalty)
    const { newRank: rankForNext } = calculateRank(trustAfter, currentRank)

    dispatch({
      type: 'act',
      outcome,
      prescript: p,
      next: decoratePrescript(getRandomPresc(pool, p.id, rankForNext), now),
      now,
      penalty,
      timeout: !!options.timeout,
    })
  }

  const execute = () => act('success')
  const diverge = () => act('fail')
  const timeoutDiverge = () => actWithOptions('fail', { timeout: true, penalty: TIMEOUT_DIVERGE_PENALTY })

  const setMode = (mode) => dispatch({ type: 'set-settings', patch: { mode } })
  const setMuted = (muted) => dispatch({ type: 'set-settings', patch: { muted } })
  const setSfxVolume = (sfxVolume) => {
    const next = Number(sfxVolume)
    const clamped = Number.isFinite(next) ? Math.max(0, Math.min(1, next)) : DEFAULTS.settings.sfxVolume
    dispatch({ type: 'set-settings', patch: { sfxVolume: clamped } })
  }
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
    const safeDifficulty = VALID_DIFFICULTIES.has(difficulty) ? difficulty : 'Easy'
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
      data: {
        ...data,
        activePrescript: decoratePrescript(getRandomPresc(rehydratedPool, null, data.currentRank)),
      },
    })
  }

  function concludeDay(source = 'manual', referenceTimestamp = Date.now()) {
    const dayToConclude = dayKey(referenceTimestamp)
    dispatch({
      type: 'conclude-day',
      day: dayToConclude,
      source,
      now: Date.now(),
    })
  }

  useEffect(() => {
    const now = new Date()
    const nextMidnight = new Date(now)
    nextMidnight.setHours(24, 0, 0, 0)
    const delay = Math.max(1, nextMidnight.getTime() - now.getTime())
    const timer = setTimeout(() => {
      concludeDay('auto-midnight', Date.now() - 1)
    }, delay)
    return () => clearTimeout(timer)
  }, [history.length])

  useEffect(() => {
    timeoutHandledPrescriptRef.current = null
  }, [activePrescript?.id, activePrescript?.deadlineAt])

  useEffect(() => {
    if (!activePrescript?.timeSensitive || !Number.isFinite(activePrescript.deadlineAt)) {
      return undefined
    }

    const remainingMs = activePrescript.deadlineAt - Date.now()
    if (remainingMs <= 0) {
      if (timeoutHandledPrescriptRef.current !== activePrescript.id) {
        timeoutHandledPrescriptRef.current = activePrescript.id
        timeoutDiverge()
      }
      return undefined
    }

    const timeoutId = setTimeout(() => {
      if (timeoutHandledPrescriptRef.current === activePrescript.id) return
      timeoutHandledPrescriptRef.current = activePrescript.id
      timeoutDiverge()
    }, remainingMs)

    return () => clearTimeout(timeoutId)
  }, [activePrescript?.id, activePrescript?.timeSensitive, activePrescript?.deadlineAt])

  return {
    // US-001
    currentRank,
    accumulatedTrust,
    // US-002
    activePrescript,
    execute,
    diverge,
    timeoutDiverge,
    timeoutSignal: state.lastTimeoutAt,
    concludeDay,
    lastEvaluation: state.lastEvaluation,
    distortionOpacity: effectiveDistortionOpacity,
    liveDistortion,
    distortionGlitchSignal: state.lastDistortionGlitchAt,
    // US-003
    history,
    // later-phase seams (exposed now, UI added later)
    settings,
    setMode,
    setMuted,
    setSfxVolume,
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

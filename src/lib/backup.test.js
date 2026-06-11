import { describe, it, expect } from 'vitest'
import { buildBackupPayload, validateBackup } from './backup.js'

describe('buildBackupPayload()', () => {
  it('returns exactly the five persisted keys', () => {
    const payload = buildBackupPayload({
      currentRank: 'Proselyte',
      accumulatedTrust: 25,
      history: [{ id: 'h1' }],
      customPrescripts: [{ id: 'c1', text: 'Hydrate', difficulty: 'Easy' }],
      settings: { mode: 'dark', muted: false },
      activePrescript: { id: 'runtime-only' },
      extra: true,
    })

    expect(payload).toEqual({
      currentRank: 'Proselyte',
      accumulatedTrust: 25,
      history: [{ id: 'h1' }],
      customPrescripts: [{ id: 'c1', text: 'Hydrate', difficulty: 'Easy' }],
      settings: { mode: 'dark', muted: false },
    })
    expect(Object.keys(payload)).toEqual([
      'currentRank',
      'accumulatedTrust',
      'history',
      'customPrescripts',
      'settings',
    ])
  })

  it('preserves payload values including arrays/objects', () => {
    const history = [{ id: 'h1' }]
    const customPrescripts = [{ id: 'c1', text: 'Hydrate', difficulty: 'Easy' }]
    const settings = { mode: 'light', muted: true }
    const payload = buildBackupPayload({
      currentRank: 'Proxy',
      accumulatedTrust: 10,
      history,
      customPrescripts,
      settings,
    })

    expect(payload.history).toEqual(history)
    expect(payload.customPrescripts).toEqual(customPrescripts)
    expect(payload.settings).toEqual(settings)
  })
})

describe('validateBackup()', () => {
  it('returns ok=true for valid payload', () => {
    const valid = buildBackupPayload({
      currentRank: 'Proselyte',
      accumulatedTrust: 0,
      history: [],
      customPrescripts: [],
      settings: { mode: 'dark' },
    })

    expect(validateBackup(valid)).toEqual({ ok: true, data: valid })
  })

  it('returns error for non-object', () => {
    const result = validateBackup(null)
    expect(result.ok).toBe(false)
    expect(result.error).toBeTypeOf('string')
  })

  it('returns error when currentRank is invalid', () => {
    const result = validateBackup({
      currentRank: 1,
      accumulatedTrust: 0,
      history: [],
      customPrescripts: [],
    })
    expect(result.ok).toBe(false)
    expect(result.error).toBeTypeOf('string')
  })

  it('returns error when accumulatedTrust is invalid', () => {
    const result = validateBackup({
      currentRank: 'Proselyte',
      accumulatedTrust: '0',
      history: [],
      customPrescripts: [],
    })
    expect(result.ok).toBe(false)
    expect(result.error).toBeTypeOf('string')
  })

  it('returns error when history is not an array', () => {
    const result = validateBackup({
      currentRank: 'Proselyte',
      accumulatedTrust: 0,
      history: {},
      customPrescripts: [],
    })
    expect(result.ok).toBe(false)
    expect(result.error).toBeTypeOf('string')
  })

  it('returns error when customPrescripts is not an array', () => {
    const result = validateBackup({
      currentRank: 'Proselyte',
      accumulatedTrust: 0,
      history: [],
      customPrescripts: {},
    })
    expect(result.ok).toBe(false)
    expect(result.error).toBeTypeOf('string')
  })

  it('accepts backups where settings is absent', () => {
    const parsed = {
      currentRank: 'Proselyte',
      accumulatedTrust: 0,
      history: [],
      customPrescripts: [],
    }
    expect(validateBackup(parsed)).toEqual({ ok: true, data: parsed })
  })
})


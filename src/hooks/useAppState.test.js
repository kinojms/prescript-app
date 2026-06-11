// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppState } from './useAppState.js'
import { STORAGE_KEYS } from '../lib/storage.js'

let store = {}

const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, value) => { store[key] = value }),
  removeItem: vi.fn((key) => { delete store[key] }),
  clear: vi.fn(() => { store = {} }),
}

beforeEach(() => {
  store = {}
  vi.clearAllMocks()
  vi.stubGlobal('localStorage', localStorageMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderAppState() {
  return renderHook(() => useAppState())
}

describe('useAppState - set-settings reducer: setMode', () => {
  it('setMode("light") changes settings.mode to "light"', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.setMode('light')
    })

    expect(result.current.settings.mode).toBe('light')
  })

  it('setMode("dark") changes settings.mode to "dark"', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.setMode('light')
    })
    act(() => {
      result.current.setMode('dark')
    })

    expect(result.current.settings.mode).toBe('dark')
  })

  it('setMode does not stomp other settings fields', () => {
    const { result } = renderAppState()

    const initialMuted = result.current.settings.muted
    const initialUseDefault = result.current.settings.useDefault
    const initialUseCustom = result.current.settings.useCustom
    const initialTheme = result.current.settings.theme

    act(() => {
      result.current.setMode('light')
    })

    expect(result.current.settings.mode).toBe('light')
    expect(result.current.settings.muted).toBe(initialMuted)
    expect(result.current.settings.useDefault).toBe(initialUseDefault)
    expect(result.current.settings.useCustom).toBe(initialUseCustom)
    expect(result.current.settings.theme).toBe(initialTheme)
  })
})

describe('useAppState - set-settings reducer: setMuted', () => {
  it('setMuted(true) changes settings.muted to true', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.setMuted(true)
    })

    expect(result.current.settings.muted).toBe(true)
  })

  it('setMuted(false) changes settings.muted to false', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.setMuted(true)
    })
    act(() => {
      result.current.setMuted(false)
    })

    expect(result.current.settings.muted).toBe(false)
  })

  it('setMuted does not stomp other settings fields', () => {
    const { result } = renderAppState()

    const initialMode = result.current.settings.mode
    const initialUseDefault = result.current.settings.useDefault
    const initialUseCustom = result.current.settings.useCustom
    const initialTheme = result.current.settings.theme

    act(() => {
      result.current.setMuted(true)
    })

    expect(result.current.settings.muted).toBe(true)
    expect(result.current.settings.mode).toBe(initialMode)
    expect(result.current.settings.useDefault).toBe(initialUseDefault)
    expect(result.current.settings.useCustom).toBe(initialUseCustom)
    expect(result.current.settings.theme).toBe(initialTheme)
  })
})

describe('useAppState - settings merge correctness', () => {
  it('chaining setMode then setMuted preserves both changes', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.setMode('light')
    })
    act(() => {
      result.current.setMuted(true)
    })

    expect(result.current.settings.mode).toBe('light')
    expect(result.current.settings.muted).toBe(true)
  })

  it('chaining setMuted then setMode preserves both changes', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.setMuted(true)
    })
    act(() => {
      result.current.setMode('light')
    })

    expect(result.current.settings.muted).toBe(true)
    expect(result.current.settings.mode).toBe('light')
  })

  it('settings has all expected keys from DEFAULTS after set-settings dispatch', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.setMode('light')
    })

    const s = result.current.settings
    expect(s).toHaveProperty('mode')
    expect(s).toHaveProperty('muted')
    expect(s).toHaveProperty('useDefault')
    expect(s).toHaveProperty('useCustom')
    expect(s).toHaveProperty('theme')
  })
})

describe('useAppState - custom prescript CRUD', () => {
  it('addCustomPrescript appends a trimmed custom prescript', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.addCustomPrescript('  Drink water  ', 'Hard')
    })

    expect(result.current.customPrescripts).toHaveLength(1)
    expect(result.current.customPrescripts[0]).toMatchObject({
      text: 'Drink water',
      difficulty: 'Hard',
    })
    expect(result.current.customPrescripts[0].id).toEqual(expect.any(String))
  })

  it('addCustomPrescript ignores empty text', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.addCustomPrescript('   ', 'Easy')
    })

    expect(result.current.customPrescripts).toHaveLength(0)
  })

  it('addCustomPrescript normalizes unknown difficulty to Easy', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.addCustomPrescript('Stretch', 'Unknown')
    })

    expect(result.current.customPrescripts[0].difficulty).toBe('Easy')
  })

  it('deleteCustomPrescript removes by id and unknown id is a no-op', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.addCustomPrescript('Hydrate', 'Easy')
      result.current.addCustomPrescript('Walk', 'Hard')
    })
    const firstId = result.current.customPrescripts[0].id
    const sizeBefore = result.current.customPrescripts.length

    act(() => {
      result.current.deleteCustomPrescript(firstId)
      result.current.deleteCustomPrescript('missing-id')
    })

    expect(result.current.customPrescripts).toHaveLength(sizeBefore - 1)
    expect(result.current.customPrescripts.some((p) => p.id === firstId)).toBe(false)
  })

  it('custom prescripts persist to storage key', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.addCustomPrescript('Breathe', 'Easy')
    })

    const persisted = JSON.parse(store[STORAGE_KEYS.custom] ?? '[]')
    expect(persisted).toHaveLength(1)
    expect(persisted[0]).toMatchObject({ text: 'Breathe', difficulty: 'Easy' })
  })
})

describe('useAppState - source toggles', () => {
  it('setSources updates both settings flags', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.setSources(true, false)
    })

    expect(result.current.settings.useDefault).toBe(true)
    expect(result.current.settings.useCustom).toBe(false)
  })

  it('setSources accepts both-false (UI guards this, not the hook)', () => {
    const { result } = renderAppState()

    act(() => {
      result.current.setSources(false, false)
    })

    expect(result.current.settings.useDefault).toBe(false)
    expect(result.current.settings.useCustom).toBe(false)
  })
})

describe('useAppState - daily prescript cap', () => {
  it('caps daily actions at 10 total entries', () => {
    const { result } = renderAppState()
    const nowSpy = vi.spyOn(Date, 'now')
    const base = new Date('2026-06-11T08:00:00.000Z').getTime()

    for (let i = 0; i < 12; i++) {
      nowSpy.mockReturnValue(base + (i * 1000))
      act(() => {
        result.current.execute()
      })
    }

    expect(result.current.history).toHaveLength(10)
    nowSpy.mockRestore()
  })

  it('allows actions again on the next day', () => {
    const { result } = renderAppState()
    const nowSpy = vi.spyOn(Date, 'now')
    const day1 = new Date('2026-06-11T23:50:00.000Z').getTime()
    const day2 = day1 + (48 * 60 * 60 * 1000)

    for (let i = 0; i < 10; i++) {
      nowSpy.mockReturnValue(day1 + (i * 1000))
      act(() => {
        result.current.execute()
      })
    }
    nowSpy.mockReturnValue(day1 + 20000)
    act(() => {
      result.current.execute()
    })
    expect(result.current.history).toHaveLength(10)

    nowSpy.mockReturnValue(day2)
    act(() => {
      result.current.execute()
    })
    expect(result.current.history).toHaveLength(11)
    nowSpy.mockRestore()
  })
})

describe('useAppState - backup export/import', () => {
  it('exportBackup triggers download with expected filename and payload', async () => {
    const { result } = renderAppState()
    let capturedBlob
    const createObjectURL = vi.fn((blob) => {
      capturedBlob = blob
      return 'blob:backup'
    })
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    act(() => {
      result.current.exportBackup()
    })

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:backup')

    const json = await capturedBlob.text()
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('currentRank')
    expect(parsed).toHaveProperty('accumulatedTrust')
    expect(parsed).toHaveProperty('history')
    expect(parsed).toHaveProperty('customPrescripts')
    expect(parsed).toHaveProperty('settings')
    expect(parsed).not.toHaveProperty('activePrescript')

    clickSpy.mockRestore()
  })

  it('importBackup with valid JSON returns ok and rehydrates state', async () => {
    const { result } = renderAppState()
    const payload = {
      currentRank: 'Proxy',
      accumulatedTrust: 77,
      history: [{
        id: 'h1',
        prescriptId: 'p1',
        text: 'Hydrate',
        difficulty: 'Easy',
        outcome: 'success',
        timestamp: 111,
      }],
      customPrescripts: [{ id: 'c1', text: 'Stretch', difficulty: 'Hard' }],
      settings: { mode: 'light', muted: true, useDefault: true, useCustom: true, theme: 'default' },
    }
    const file = new File([JSON.stringify(payload)], 'index_prescript_backup.json', {
      type: 'application/json',
    })

    let response
    await act(async () => {
      response = await result.current.importBackup(file)
    })

    expect(response).toEqual({ ok: true })
    expect(result.current.currentRank).toBe('Proxy')
    expect(result.current.accumulatedTrust).toBe(77)
    expect(result.current.history).toHaveLength(1)
    expect(result.current.customPrescripts).toHaveLength(1)
    expect(result.current.settings.mode).toBe('light')
  })

  it('importBackup invalid JSON returns error and leaves storage untouched', async () => {
    const { result } = renderAppState()
    const snapshot = { ...store }
    const badFile = new File(['{oops'], 'broken.json', { type: 'application/json' })

    let response
    await act(async () => {
      response = await result.current.importBackup(badFile)
    })

    expect(response.ok).toBe(false)
    expect(response.error).toEqual(expect.any(String))
    expect(store).toEqual(snapshot)
  })

  it('importBackup structural validation failure returns error and does not update state', async () => {
    const { result } = renderAppState()
    const beforeRank = result.current.currentRank
    const beforeTrust = result.current.accumulatedTrust
    const invalid = {
      currentRank: 'Proxy',
      accumulatedTrust: 1,
      history: {},
      customPrescripts: [],
    }
    const file = new File([JSON.stringify(invalid)], 'bad-shape.json', { type: 'application/json' })

    let response
    await act(async () => {
      response = await result.current.importBackup(file)
    })

    expect(response.ok).toBe(false)
    expect(response.error).toEqual(expect.any(String))
    expect(result.current.currentRank).toBe(beforeRank)
    expect(result.current.accumulatedTrust).toBe(beforeTrust)
  })

  it('importBackup without file returns a no-file error', async () => {
    const { result } = renderAppState()

    let response
    await act(async () => {
      response = await result.current.importBackup(null)
    })

    expect(response).toEqual({ ok: false, error: 'No file selected.' })
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readKey, writeKey, STORAGE_KEYS } from './storage.js'

// ---------------------------------------------------------------------------
// localStorage mock — manually implemented so we can simulate error paths.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
describe('STORAGE_KEYS', () => {
  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(STORAGE_KEYS)).toBe(true)
  })

  it('exposes the five namespaced keys', () => {
    expect(STORAGE_KEYS.rank).toBe('index_prescript_rank')
    expect(STORAGE_KEYS.trust).toBe('index_prescript_trust')
    expect(STORAGE_KEYS.history).toBe('index_prescript_history')
    expect(STORAGE_KEYS.custom).toBe('index_prescript_custom_prescripts')
    expect(STORAGE_KEYS.settings).toBe('index_prescript_settings')
  })

  it('all key values start with "index_prescript_"', () => {
    for (const v of Object.values(STORAGE_KEYS)) {
      expect(v.startsWith('index_prescript_')).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
describe('readKey()', () => {
  it('returns the fallback when the key is absent (getItem returns null)', () => {
    localStorageMock.getItem.mockReturnValueOnce(null)
    expect(readKey('any_key', 'DEFAULT')).toBe('DEFAULT')
  })

  it('returns a parsed number', () => {
    localStorageMock.getItem.mockReturnValueOnce('42')
    expect(readKey('any_key', 0)).toBe(42)
  })

  it('returns a parsed object', () => {
    localStorageMock.getItem.mockReturnValueOnce('{"a":1}')
    expect(readKey('any_key', {})).toEqual({ a: 1 })
  })

  it('returns a parsed array', () => {
    localStorageMock.getItem.mockReturnValueOnce('[1,2,3]')
    expect(readKey('any_key', [])).toEqual([1, 2, 3])
  })

  it('returns the fallback when JSON is corrupt', () => {
    localStorageMock.getItem.mockReturnValueOnce('{bad json!!')
    expect(readKey('any_key', 'FALLBACK')).toBe('FALLBACK')
  })

  it('returns the fallback when getItem throws', () => {
    localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('storage error') })
    expect(readKey('any_key', 99)).toBe(99)
  })

  it('returns a boolean false value (not confused with null)', () => {
    localStorageMock.getItem.mockReturnValueOnce('false')
    expect(readKey('any_key', true)).toBe(false)
  })

  it('returns a null JSON literal (not the fallback)', () => {
    localStorageMock.getItem.mockReturnValueOnce('null')
    // JSON.parse('null') === null; key IS present so fallback is not used
    expect(readKey('any_key', 'FALLBACK')).toBeNull()
  })

  it('returns a parsed string value', () => {
    localStorageMock.getItem.mockReturnValueOnce('"Proselyte"')
    expect(readKey('any_key', '')).toBe('Proselyte')
  })

  it('returns zero (not fallback) when stored value is 0', () => {
    localStorageMock.getItem.mockReturnValueOnce('0')
    expect(readKey('any_key', 999)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
describe('writeKey()', () => {
  it('serializes a number to localStorage', () => {
    writeKey('test_key', 42)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test_key', '42')
  })

  it('serializes an object to localStorage', () => {
    writeKey('test_key', { a: 1 })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test_key', '{"a":1}')
  })

  it('serializes an array to localStorage', () => {
    writeKey('test_key', [1, 2, 3])
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test_key', '[1,2,3]')
  })

  it('serializes a string to localStorage', () => {
    writeKey('test_key', 'Proselyte')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test_key', '"Proselyte"')
  })

  it('serializes null to localStorage', () => {
    writeKey('test_key', null)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test_key', 'null')
  })

  it('does NOT throw when setItem throws (quota exceeded)', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError')
    })
    expect(() => writeKey('test_key', 'value')).not.toThrow()
  })

  it('does NOT throw when JSON.stringify throws (e.g. circular reference)', () => {
    const circular = {}
    circular.self = circular
    expect(() => writeKey('test_key', circular)).not.toThrow()
  })
})

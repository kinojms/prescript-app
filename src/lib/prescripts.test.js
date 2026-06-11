import { describe, it, expect, vi } from 'vitest'
import { getRandomPresc } from './prescripts.js'

const makePool = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `p-${i + 1}`,
    text: `Prescript ${i + 1}`,
    difficulty: 'Easy',
  }))

describe('getRandomPresc()', () => {
  // --- Empty / invalid pool ---
  it('returns null for an empty array', () => {
    expect(getRandomPresc([])).toBeNull()
  })

  it('returns null for a non-array value (null)', () => {
    expect(getRandomPresc(null)).toBeNull()
  })

  it('returns null for a non-array value (undefined)', () => {
    expect(getRandomPresc(undefined)).toBeNull()
  })

  it('returns null for a non-array value (string)', () => {
    expect(getRandomPresc('nope')).toBeNull()
  })

  it('returns null for a non-array value (number)', () => {
    expect(getRandomPresc(42)).toBeNull()
  })

  // --- Single-item pool ---
  it('returns the only item even when it matches excludeId', () => {
    const pool = [{ id: 'sole', text: 'Only one', difficulty: 'Easy' }]
    const result = getRandomPresc(pool, 'sole')
    expect(result).not.toBeNull()
    expect(result.id).toBe('sole')
  })

  it('returns the only item when excludeId is null', () => {
    const pool = [{ id: 'sole', text: 'Only one', difficulty: 'Easy' }]
    const result = getRandomPresc(pool, null)
    expect(result.id).toBe('sole')
  })

  it('returns the only item when excludeId is not provided', () => {
    const pool = [{ id: 'sole', text: 'Only one', difficulty: 'Easy' }]
    const result = getRandomPresc(pool)
    expect(result.id).toBe('sole')
  })

  // --- Exclusion correctness over many draws ---
  it('never returns the excluded item from a pool of 2 (100 iterations)', () => {
    const pool = makePool(2)
    const excludeId = 'p-1'
    for (let i = 0; i < 100; i++) {
      const result = getRandomPresc(pool, excludeId)
      expect(result.id).not.toBe(excludeId)
    }
  })

  it('never returns the excluded item from a larger pool (100 iterations)', () => {
    const pool = makePool(12)
    const excludeId = 'p-6'
    for (let i = 0; i < 100; i++) {
      const result = getRandomPresc(pool, excludeId)
      expect(result.id).not.toBe(excludeId)
    }
  })

  // --- No exclusion: any valid item can be returned ---
  it('returns an item from the pool when excludeId is null', () => {
    const pool = makePool(5)
    const result = getRandomPresc(pool, null)
    expect(result).not.toBeNull()
    expect(pool.some(p => p.id === result.id)).toBe(true)
  })

  // --- Deterministic index math via Math.random mock ---
  it('returns first candidate when Math.random() returns 0', () => {
    const pool = makePool(3)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = getRandomPresc(pool, 'p-1') // candidates: p-2, p-3
    expect(result.id).toBe('p-2')
    vi.restoreAllMocks()
  })

  it('returns last candidate when Math.random() returns very close to 1', () => {
    const pool = makePool(3)
    vi.spyOn(Math, 'random').mockReturnValue(0.9999)
    const result = getRandomPresc(pool, 'p-1') // candidates: p-2, p-3 (length 2)
    expect(result.id).toBe('p-3')
    vi.restoreAllMocks()
  })

  // --- Return value is the actual pool object reference, not a copy ---
  it('returns the same object reference that is in the pool', () => {
    const pool = makePool(3)
    const result = getRandomPresc(pool, 'p-1')
    expect(pool).toContain(result)
  })

  // --- excludeId that doesn't match any entry is fine ---
  it('ignores a non-matching excludeId and picks from the full pool', () => {
    const pool = makePool(3)
    // excludeId 'p-99' does not exist — all three are candidates
    const seen = new Set()
    for (let i = 0; i < 200; i++) {
      seen.add(getRandomPresc(pool, 'p-99').id)
    }
    // With 200 draws from 3 items we expect all three to have appeared
    expect(seen.size).toBe(3)
  })
})

import { describe, it, expect, vi } from 'vitest'
import { DIFFICULTY_WEIGHTS_BY_RANK, getRandomPresc } from './prescripts.js'

const makePool = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `p-${i + 1}`,
    text: `Prescript ${i + 1}`,
    difficulty: 'Easy',
  }))

describe('getRandomPresc()', () => {
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

  it('returns an item from the pool when excludeId is null', () => {
    const pool = makePool(5)
    const result = getRandomPresc(pool, null)
    expect(result).not.toBeNull()
    expect(pool.some((p) => p.id === result.id)).toBe(true)
  })

  it('returns the first candidate when math rolls to first bucket and first item', () => {
    const pool = makePool(3)
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0) // weighted roll
      .mockReturnValueOnce(0) // final pool pick

    const result = getRandomPresc(pool, 'p-1')
    expect(result.id).toBe('p-2')

    vi.restoreAllMocks()
  })

  it('returns the last candidate when final pool pick roll is near one', () => {
    const pool = makePool(3)
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0) // weighted roll
      .mockReturnValueOnce(0.9999) // final pool pick

    const result = getRandomPresc(pool, 'p-1')
    expect(result.id).toBe('p-3')

    vi.restoreAllMocks()
  })

  it('returns the same object reference that is in the pool', () => {
    const pool = makePool(3)
    const result = getRandomPresc(pool, 'p-1')
    expect(pool).toContain(result)
  })

  it('ignores a non-matching excludeId and picks from the full pool', () => {
    const pool = makePool(3)
    const seen = new Set()
    for (let i = 0; i < 200; i++) {
      seen.add(getRandomPresc(pool, 'p-99').id)
    }
    expect(seen.size).toBe(3)
  })

  it('uses Proselyte weighting to choose Hard when roll is in the hard bucket', () => {
    const pool = [
      { id: 'e', text: 'Easy', difficulty: 'Easy' },
      { id: 'm', text: 'Medium', difficulty: 'Medium' },
      { id: 'h', text: 'Hard', difficulty: 'Hard' },
    ]

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.99) // weighted difficulty roll => hard
      .mockReturnValueOnce(0) // pick first in hard pool (single)

    const result = getRandomPresc(pool, null, 'Proselyte')
    expect(result.id).toBe('h')

    vi.restoreAllMocks()
  })

  it('uses Proxy weighting to choose Medium for middle roll', () => {
    const pool = [
      { id: 'e', text: 'Easy', difficulty: 'Easy' },
      { id: 'm', text: 'Medium', difficulty: 'Medium' },
      { id: 'h', text: 'Hard', difficulty: 'Hard' },
    ]

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.55) // proxy: easy 0.4 then medium up to 0.9
      .mockReturnValueOnce(0)

    const result = getRandomPresc(pool, null, 'Proxy')
    expect(result.id).toBe('m')

    vi.restoreAllMocks()
  })

  it('uses Grace of the Prescript weighting to bias to Hard', () => {
    const pool = [
      { id: 'e', text: 'Easy', difficulty: 'Easy' },
      { id: 'm', text: 'Medium', difficulty: 'Medium' },
      { id: 'h', text: 'Hard', difficulty: 'Hard' },
    ]

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8) // grace hard bucket
      .mockReturnValueOnce(0)

    const result = getRandomPresc(pool, null, 'Grace of the Prescript')
    expect(result.id).toBe('h')

    vi.restoreAllMocks()
  })

  it('falls back to available difficulties when selected difficulty is missing', () => {
    const pool = [
      { id: 'm1', text: 'M1', difficulty: 'Medium' },
      { id: 'm2', text: 'M2', difficulty: 'Medium' },
    ]

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.01) // would pick easy for proselyte, but unavailable
      .mockReturnValueOnce(0) // pick in medium pool

    const result = getRandomPresc(pool, null, 'Proselyte')
    expect(result.difficulty).toBe('Medium')

    vi.restoreAllMocks()
  })
})

describe('DIFFICULTY_WEIGHTS_BY_RANK', () => {
  it('defines rank difficulty rates that sum to 1', () => {
    for (const weights of Object.values(DIFFICULTY_WEIGHTS_BY_RANK)) {
      const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
      expect(total).toBeCloseTo(1, 10)
    }
  })
})

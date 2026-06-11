import { describe, it, expect } from 'vitest'
import { DEFAULT_PRESCRIPTS } from './defaultPrescripts.js'

const VALID_DIFFICULTIES = new Set(['Easy', 'Hard'])

describe('DEFAULT_PRESCRIPTS', () => {
  // --- Count / shape ---
  it('is an array', () => {
    expect(Array.isArray(DEFAULT_PRESCRIPTS)).toBe(true)
  })

  it('contains between 10 and 15 entries', () => {
    expect(DEFAULT_PRESCRIPTS.length).toBeGreaterThanOrEqual(10)
    expect(DEFAULT_PRESCRIPTS.length).toBeLessThanOrEqual(15)
  })

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(DEFAULT_PRESCRIPTS)).toBe(true)
  })

  // --- Per-entry structural contract ---
  it('every entry has an id property', () => {
    for (const p of DEFAULT_PRESCRIPTS) {
      expect(p).toHaveProperty('id')
    }
  })

  it('every entry has a text property', () => {
    for (const p of DEFAULT_PRESCRIPTS) {
      expect(p).toHaveProperty('text')
    }
  })

  it('every entry has a difficulty property', () => {
    for (const p of DEFAULT_PRESCRIPTS) {
      expect(p).toHaveProperty('difficulty')
    }
  })

  // --- Field type & value constraints ---
  it('every id is a non-empty string', () => {
    for (const p of DEFAULT_PRESCRIPTS) {
      expect(typeof p.id).toBe('string')
      expect(p.id.length).toBeGreaterThan(0)
    }
  })

  it('every text is a non-empty string', () => {
    for (const p of DEFAULT_PRESCRIPTS) {
      expect(typeof p.text).toBe('string')
      expect(p.text.length).toBeGreaterThan(0)
    }
  })

  it('every difficulty is either "Easy" or "Hard"', () => {
    for (const p of DEFAULT_PRESCRIPTS) {
      expect(VALID_DIFFICULTIES.has(p.difficulty)).toBe(true)
    }
  })

  // --- Uniqueness ---
  it('all ids are unique', () => {
    const ids = DEFAULT_PRESCRIPTS.map(p => p.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('all texts are unique', () => {
    const texts = DEFAULT_PRESCRIPTS.map(p => p.text)
    const unique = new Set(texts)
    expect(unique.size).toBe(texts.length)
  })

  // --- Pool usability (getRandomPresc requires objects with id field) ---
  it('each entry can serve as a valid pool item for getRandomPresc (has id field)', () => {
    for (const p of DEFAULT_PRESCRIPTS) {
      expect(typeof p.id).toBe('string')
    }
  })
})

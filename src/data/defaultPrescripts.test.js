import { describe, it, expect } from 'vitest'
import { DEFAULT_PRESCRIPTS } from './defaultPrescripts.js'

const VALID_DIFFICULTIES = new Set(['Easy', 'Medium', 'Hard'])

describe('DEFAULT_PRESCRIPTS', () => {
  // --- Count / shape ---
  it('is an array', () => {
    expect(Array.isArray(DEFAULT_PRESCRIPTS)).toBe(true)
  })

  it('contains at least 15 entries', () => {
    expect(DEFAULT_PRESCRIPTS.length).toBeGreaterThanOrEqual(15)
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

  it('every difficulty is Easy, Medium, or Hard', () => {
    for (const p of DEFAULT_PRESCRIPTS) {
      expect(VALID_DIFFICULTIES.has(p.difficulty)).toBe(true)
    }
  })

  it('contains required canonical directives verbatim', () => {
    const texts = new Set(DEFAULT_PRESCRIPTS.map((p) => p.text))
    expect(texts.has('Stare blankly at the ceiling for exactly 60 seconds.')).toBe(true)
    expect(texts.has('Perform a full-body standing stretch for 1 minute.')).toBe(true)
    expect(texts.has('Consume a full glass of clear water immediately.')).toBe(true)
    expect(texts.has('Drop and execute 5 disciplined push-ups.')).toBe(true)
    expect(texts.has('Read a news article to observe the status of the City.')).toBe(true)
    expect(texts.has('Cook a proper meal for your evening sustenance.')).toBe(true)
    expect(texts.has('Conclude your next bathroom visit without utilizing toilet paper.')).toBe(true)
    expect(texts.has('Sustain yourself strictly on white rice for your next meal.')).toBe(true)
    expect(texts.has('Abstain entirely from using AI assistance or language models for the next 4 hours.')).toBe(true)
    expect(texts.has('Maintain perfect balance on one foot for 5 consecutive minutes.')).toBe(true)
    expect(texts.has('Recite the alphabet completely in reverse, scattered randomly into your next human conversation without allowing an interruption.')).toBe(true)
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

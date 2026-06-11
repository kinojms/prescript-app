import { describe, it, expect } from 'vitest'
import { isValidPrescript, isValidHistoryEntry } from './hydration.js'

// ---------------------------------------------------------------------------
describe('isValidPrescript()', () => {
  // --- Happy path ---
  it('accepts a well-formed prescript', () => {
    expect(isValidPrescript({ id: 'p-1', text: 'Do the thing.', difficulty: 'Easy' })).toBe(true)
  })

  it('accepts extra unknown fields (forward-compatible)', () => {
    expect(isValidPrescript({ id: 'p-1', text: 'Do the thing.', difficulty: 'Hard', extra: 42 })).toBe(true)
  })

  // --- Null / non-object guards ---
  it('rejects null', () => {
    expect(isValidPrescript(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(isValidPrescript(undefined)).toBe(false)
  })

  it('rejects a plain number', () => {
    expect(isValidPrescript(42)).toBe(false)
  })

  it('rejects a string', () => {
    expect(isValidPrescript('p-1')).toBe(false)
  })

  it('rejects an array', () => {
    expect(isValidPrescript([])).toBe(false)
  })

  // --- Missing / wrong-type fields ---
  it('rejects when id is missing', () => {
    expect(isValidPrescript({ text: 'Do it.', difficulty: 'Easy' })).toBe(false)
  })

  it('rejects when text is missing', () => {
    expect(isValidPrescript({ id: 'p-1', difficulty: 'Easy' })).toBe(false)
  })

  it('rejects when difficulty is missing', () => {
    expect(isValidPrescript({ id: 'p-1', text: 'Do it.' })).toBe(false)
  })

  it('rejects when id is a number instead of string', () => {
    expect(isValidPrescript({ id: 1, text: 'Do it.', difficulty: 'Easy' })).toBe(false)
  })

  it('rejects when text is null', () => {
    expect(isValidPrescript({ id: 'p-1', text: null, difficulty: 'Easy' })).toBe(false)
  })

  it('rejects when difficulty is a boolean', () => {
    expect(isValidPrescript({ id: 'p-1', text: 'Do it.', difficulty: true })).toBe(false)
  })
})

// ---------------------------------------------------------------------------
describe('isValidHistoryEntry()', () => {
  const validEntry = {
    id: 'p-1-1234567890',
    text: 'Do the thing.',
    difficulty: 'Easy',
    outcome: 'success',
    timestamp: 1234567890,
  }

  // --- Happy path ---
  it('accepts a well-formed history entry', () => {
    expect(isValidHistoryEntry(validEntry)).toBe(true)
  })

  it('accepts extra unknown fields (forward-compatible)', () => {
    expect(isValidHistoryEntry({ ...validEntry, prescriptId: 'p-1' })).toBe(true)
  })

  // --- timestamp must be a number, not a string ---
  it('accepts timestamp 0 (falsy number is still valid)', () => {
    expect(isValidHistoryEntry({ ...validEntry, timestamp: 0 })).toBe(true)
  })

  it('rejects when timestamp is a string', () => {
    expect(isValidHistoryEntry({ ...validEntry, timestamp: '1234567890' })).toBe(false)
  })

  it('rejects when timestamp is null', () => {
    expect(isValidHistoryEntry({ ...validEntry, timestamp: null })).toBe(false)
  })

  // --- Null / non-object guards ---
  it('rejects null', () => {
    expect(isValidHistoryEntry(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(isValidHistoryEntry(undefined)).toBe(false)
  })

  it('rejects a string', () => {
    expect(isValidHistoryEntry('entry')).toBe(false)
  })

  // --- Missing / wrong-type fields ---
  it('rejects when id is missing', () => {
    const { id, ...rest } = validEntry
    expect(isValidHistoryEntry(rest)).toBe(false)
  })

  it('rejects when text is missing', () => {
    const { text, ...rest } = validEntry
    expect(isValidHistoryEntry(rest)).toBe(false)
  })

  it('rejects when difficulty is missing', () => {
    const { difficulty, ...rest } = validEntry
    expect(isValidHistoryEntry(rest)).toBe(false)
  })

  it('rejects when outcome is missing', () => {
    const { outcome, ...rest } = validEntry
    expect(isValidHistoryEntry(rest)).toBe(false)
  })

  it('rejects when timestamp is missing', () => {
    const { timestamp, ...rest } = validEntry
    expect(isValidHistoryEntry(rest)).toBe(false)
  })

  it('rejects when outcome is a number instead of string', () => {
    expect(isValidHistoryEntry({ ...validEntry, outcome: 1 })).toBe(false)
  })
})

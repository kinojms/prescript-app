import { describe, it, expect } from 'vitest'
import { calculateRank, RANKS, TRUST_AWARD } from './rank.js'

describe('RANKS', () => {
  it('has exactly three entries in the correct order', () => {
    expect(RANKS).toHaveLength(3)
    expect(RANKS[0].name).toBe('Proselyte')
    expect(RANKS[1].name).toBe('Proxy')
    expect(RANKS[2].name).toBe("The Oracle's Proxy")
  })

  it('has the correct promotion thresholds', () => {
    expect(RANKS[0].threshold).toBe(100)
    expect(RANKS[1].threshold).toBe(250)
    expect(RANKS[2].threshold).toBe(Infinity)
  })

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(RANKS)).toBe(true)
  })
})

describe('TRUST_AWARD', () => {
  it('awards 5 for Easy', () => {
    expect(TRUST_AWARD.Easy).toBe(5)
  })

  it('awards 10 for Hard', () => {
    expect(TRUST_AWARD.Hard).toBe(10)
  })

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(TRUST_AWARD)).toBe(true)
  })
})

describe('calculateRank()', () => {
  // --- Proselyte promotion boundary ---
  it('does NOT promote when trust is exactly one below threshold (99)', () => {
    const result = calculateRank(99, 'Proselyte')
    expect(result.newRank).toBe('Proselyte')
    expect(result.newTrust).toBe(99)
    expect(result.promoted).toBe(false)
  })

  it('promotes Proselyte → Proxy at exactly 100 trust', () => {
    const result = calculateRank(100, 'Proselyte')
    expect(result.newRank).toBe('Proxy')
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(true)
  })

  it('promotes Proselyte → Proxy above 100 trust (not a skip)', () => {
    const result = calculateRank(115, 'Proselyte')
    expect(result.newRank).toBe('Proxy')
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(true)
  })

  // --- Proxy promotion boundary ---
  it('does NOT promote Proxy when trust is 249', () => {
    const result = calculateRank(249, 'Proxy')
    expect(result.newRank).toBe('Proxy')
    expect(result.newTrust).toBe(249)
    expect(result.promoted).toBe(false)
  })

  it('promotes Proxy → Oracle\'s Proxy at exactly 250 trust', () => {
    const result = calculateRank(250, 'Proxy')
    expect(result.newRank).toBe("The Oracle's Proxy")
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(true)
  })

  it('promotes Proxy → Oracle\'s Proxy above 250 trust', () => {
    const result = calculateRank(265, 'Proxy')
    expect(result.newRank).toBe("The Oracle's Proxy")
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(true)
  })

  // --- Max rank: trust accumulates, no further promotion ---
  it('does not promote at max rank even with very high trust', () => {
    const result = calculateRank(9999, "The Oracle's Proxy")
    expect(result.newRank).toBe("The Oracle's Proxy")
    expect(result.newTrust).toBe(9999)
    expect(result.promoted).toBe(false)
  })

  it('accumulates trust at max rank (keeps the exact value)', () => {
    const result = calculateRank(251, "The Oracle's Proxy")
    expect(result.newTrust).toBe(251)
  })

  // --- Trust reset on promotion ---
  it('resets trust to exactly 0 on promotion (no carryover)', () => {
    const result = calculateRank(150, 'Proselyte')
    expect(result.newTrust).toBe(0)
  })

  // --- Single-step promotions only ---
  it('promotes only one step even when trust far exceeds next threshold', () => {
    // 300 trust from Proselyte: only goes to Proxy, not Oracle's Proxy
    const result = calculateRank(300, 'Proselyte')
    expect(result.newRank).toBe('Proxy')
  })

  // --- Unknown rank defensive fallback ---
  it('treats an unknown rank name as the first rank (Proselyte)', () => {
    const result = calculateRank(50, 'SomeUnknownRank')
    expect(result.newRank).toBe('Proselyte')
    expect(result.newTrust).toBe(50)
    expect(result.promoted).toBe(false)
  })

  it('promotes from unknown rank at Proselyte threshold', () => {
    const result = calculateRank(100, 'SomeUnknownRank')
    expect(result.newRank).toBe('Proxy')
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(true)
  })

  // --- Zero trust edge case ---
  it('returns Proselyte with 0 trust and no promotion for fresh state', () => {
    const result = calculateRank(0, 'Proselyte')
    expect(result.newRank).toBe('Proselyte')
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(false)
  })
})

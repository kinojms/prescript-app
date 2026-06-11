import { describe, it, expect } from 'vitest'
import { calculateRank, RANKS, TRUST_AWARD } from './rank.js'

describe('RANKS', () => {
  it('has exactly three entries in the correct order', () => {
    expect(RANKS).toHaveLength(3)
    expect(RANKS[0].name).toBe('Proselyte')
    expect(RANKS[1].name).toBe('Proxy')
    expect(RANKS[2].name).toBe('Grace of the Prescript')
  })

  it('has the correct promotion thresholds', () => {
    expect(RANKS[0].threshold).toBe(150)
    expect(RANKS[1].threshold).toBe(300)
    expect(RANKS[2].threshold).toBe(Infinity)
  })

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(RANKS)).toBe(true)
  })
})

describe('TRUST_AWARD', () => {
  it('awards 1 for Easy', () => {
    expect(TRUST_AWARD.Easy).toBe(1)
  })

  it('awards 5 for Medium', () => {
    expect(TRUST_AWARD.Medium).toBe(5)
  })

  it('awards 10 for Hard', () => {
    expect(TRUST_AWARD.Hard).toBe(10)
  })

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(TRUST_AWARD)).toBe(true)
  })
})

describe('calculateRank()', () => {
  it('does NOT promote when trust is exactly one below threshold (149)', () => {
    const result = calculateRank(149, 'Proselyte')
    expect(result.newRank).toBe('Proselyte')
    expect(result.newTrust).toBe(149)
    expect(result.promoted).toBe(false)
  })

  it('promotes Proselyte -> Proxy at exactly 150 trust', () => {
    const result = calculateRank(150, 'Proselyte')
    expect(result.newRank).toBe('Proxy')
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(true)
  })

  it('promotes Proselyte -> Proxy above 150 trust (not a skip)', () => {
    const result = calculateRank(165, 'Proselyte')
    expect(result.newRank).toBe('Proxy')
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(true)
  })

  it('does NOT promote Proxy when trust is 299', () => {
    const result = calculateRank(299, 'Proxy')
    expect(result.newRank).toBe('Proxy')
    expect(result.newTrust).toBe(299)
    expect(result.promoted).toBe(false)
  })

  it('promotes Proxy -> Grace of the Prescript at exactly 300 trust', () => {
    const result = calculateRank(300, 'Proxy')
    expect(result.newRank).toBe('Grace of the Prescript')
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(true)
  })

  it('promotes Proxy -> Grace of the Prescript above 300 trust', () => {
    const result = calculateRank(315, 'Proxy')
    expect(result.newRank).toBe('Grace of the Prescript')
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(true)
  })

  it('does not promote at max rank even with very high trust', () => {
    const result = calculateRank(9999, 'Grace of the Prescript')
    expect(result.newRank).toBe('Grace of the Prescript')
    expect(result.newTrust).toBe(9999)
    expect(result.promoted).toBe(false)
  })

  it('accumulates trust at max rank (keeps the exact value)', () => {
    const result = calculateRank(251, 'Grace of the Prescript')
    expect(result.newTrust).toBe(251)
  })

  it('resets trust to exactly 0 on promotion (no carryover)', () => {
    const result = calculateRank(150, 'Proselyte')
    expect(result.newTrust).toBe(0)
  })

  it('promotes only one step even when trust far exceeds next threshold', () => {
    const result = calculateRank(300, 'Proselyte')
    expect(result.newRank).toBe('Proxy')
  })

  it('treats an unknown rank name as the first rank (Proselyte)', () => {
    const result = calculateRank(50, 'SomeUnknownRank')
    expect(result.newRank).toBe('Proselyte')
    expect(result.newTrust).toBe(50)
    expect(result.promoted).toBe(false)
  })

  it('promotes from unknown rank at Proselyte threshold', () => {
    const result = calculateRank(150, 'SomeUnknownRank')
    expect(result.newRank).toBe('Proxy')
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(true)
  })

  it('returns Proselyte with 0 trust and no promotion for fresh state', () => {
    const result = calculateRank(0, 'Proselyte')
    expect(result.newRank).toBe('Proselyte')
    expect(result.newTrust).toBe(0)
    expect(result.promoted).toBe(false)
  })
})

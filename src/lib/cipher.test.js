import { describe, it, expect } from 'vitest'
import { SHUFFLE_GLYPHS, SHUFFLE_FRAME_MS, randomGlyph, buildCipherFrame } from './cipher.js'

describe('SHUFFLE_GLYPHS', () => {
  it('is a non-empty string', () => {
    expect(typeof SHUFFLE_GLYPHS).toBe('string')
    expect(SHUFFLE_GLYPHS.length).toBeGreaterThan(0)
  })
})

describe('SHUFFLE_FRAME_MS', () => {
  it('is 45', () => {
    expect(SHUFFLE_FRAME_MS).toBe(45)
  })
})

describe('randomGlyph()', () => {
  it('returns a single character that is a member of SHUFFLE_GLYPHS', () => {
    for (let i = 0; i < 50; i++) {
      const glyph = randomGlyph()
      expect(glyph).toHaveLength(1)
      expect(SHUFFLE_GLYPHS).toContain(glyph)
    }
  })
})

describe('buildCipherFrame()', () => {
  it('returns target exactly when resolvedCount equals target.length', () => {
    const target = 'HELLO WORLD'
    expect(buildCipherFrame(target, target.length)).toBe(target)
  })

  it('preserves spaces regardless of resolvedCount', () => {
    const target = 'A B C'
    const frame = buildCipherFrame(target, 0)
    expect(frame[1]).toBe(' ')
    expect(frame[3]).toBe(' ')
  })

  it('chars before resolvedCount match target', () => {
    const target = 'HELLO'
    const resolvedCount = 3
    const frame = buildCipherFrame(target, resolvedCount)
    expect(frame.slice(0, resolvedCount)).toBe(target.slice(0, resolvedCount))
  })

  it('chars at or after resolvedCount (non-space) are from SHUFFLE_GLYPHS', () => {
    const target = 'HELLO'
    const resolvedCount = 2
    const frame = buildCipherFrame(target, resolvedCount)
    for (let i = resolvedCount; i < target.length; i++) {
      if (target[i] !== ' ') {
        expect(SHUFFLE_GLYPHS).toContain(frame[i])
      }
    }
  })

  it('returns target for an empty string', () => {
    expect(buildCipherFrame('', 0)).toBe('')
  })

  it('output length always matches target length', () => {
    const target = 'TESTING 123'
    for (let i = 0; i <= target.length; i++) {
      expect(buildCipherFrame(target, i)).toHaveLength(target.length)
    }
  })
})

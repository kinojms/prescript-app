export const SHUFFLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>?/|\\[]{}'
export const SHUFFLE_FRAME_MS = 45

export function randomGlyph() {
  return SHUFFLE_GLYPHS[Math.floor(Math.random() * SHUFFLE_GLYPHS.length)]
}

export function buildCipherFrame(target, resolvedCount) {
  return target
    .split('')
    .map((char, index) => {
      if (char === ' ' || index < resolvedCount) return char
      return randomGlyph()
    })
    .join('')
}

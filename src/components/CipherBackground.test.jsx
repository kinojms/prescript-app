// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render as rtlRender, cleanup } from '@testing-library/react'
import CipherBackground from './CipherBackground.jsx'

// ---------------------------------------------------------------------------
// Stubs for canvas, rAF, and cancelAnimationFrame
// jsdom doesn't implement canvas getContext — stub it so effects don't throw.
// ---------------------------------------------------------------------------

let fakeCtx

beforeEach(() => {
  fakeCtx = {
    setTransform: vi.fn(),
    scale: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    font: '',
    textBaseline: '',
    fillStyle: '',
  }

  // Stub canvas getContext
  HTMLCanvasElement.prototype.getContext = vi.fn(() => fakeCtx)

  // Stub rAF — return a stable id, do NOT auto-invoke the callback to
  // prevent infinite recursion in the tick() loop.
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 123))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
describe('CipherBackground — mount', () => {
  it('renders a canvas element', () => {
    const { container } = rtlRender(<CipherBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
  })

  it('canvas has aria-hidden="true"', () => {
    const { container } = rtlRender(<CipherBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas.getAttribute('aria-hidden')).toBe('true')
  })

  it('canvas has pointer-events-none class', () => {
    const { container } = rtlRender(<CipherBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas.className).toContain('pointer-events-none')
  })

  it('canvas has z-0 class (visible layer behind content shell)', () => {
    const { container } = rtlRender(<CipherBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas.className).toContain('z-0')
  })

  it('canvas has opacity-90 class for stronger visibility', () => {
    const { container } = rtlRender(<CipherBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas.className).toContain('opacity-90')
  })

  it('canvas has fixed positioning class', () => {
    const { container } = rtlRender(<CipherBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas.className).toContain('fixed')
  })

  it('requestAnimationFrame is called on mount (animation loop starts)', () => {
    rtlRender(<CipherBackground />)
    expect(requestAnimationFrame).toHaveBeenCalled()
  })

  it('canvas getContext("2d") is called on mount', () => {
    rtlRender(<CipherBackground />)
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d')
  })

  it('visibilitychange listener is attached to document on mount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    rtlRender(<CipherBackground />)
    const calls = addSpy.mock.calls.map(([type]) => type)
    expect(calls).toContain('visibilitychange')
  })

  it('resize listener is attached to window on mount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    rtlRender(<CipherBackground />)
    const calls = addSpy.mock.calls.map(([type]) => type)
    expect(calls).toContain('resize')
  })
})

// ---------------------------------------------------------------------------
describe('CipherBackground — unmount cleanup', () => {
  it('cancelAnimationFrame is called on unmount', () => {
    const { unmount } = rtlRender(<CipherBackground />)
    unmount()
    expect(cancelAnimationFrame).toHaveBeenCalledWith(123)
  })

  it('visibilitychange listener is removed from document on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = rtlRender(<CipherBackground />)
    unmount()
    const calls = removeSpy.mock.calls.map(([type]) => type)
    expect(calls).toContain('visibilitychange')
  })

  it('resize listener is removed from window on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = rtlRender(<CipherBackground />)
    unmount()
    const calls = removeSpy.mock.calls.map(([type]) => type)
    expect(calls).toContain('resize')
  })

  it('visibilitychange: same handler reference added and removed', () => {
    const docAddSpy = vi.spyOn(document, 'addEventListener')
    const docRemoveSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = rtlRender(<CipherBackground />)

    // Capture the handler registered for 'visibilitychange'
    const addCall = docAddSpy.mock.calls.find(([type]) => type === 'visibilitychange')
    expect(addCall).toBeDefined()
    const registeredHandler = addCall[1]

    unmount()

    // The remove call must use the same handler reference
    const removeCall = docRemoveSpy.mock.calls.find(
      ([type, fn]) => type === 'visibilitychange' && fn === registeredHandler
    )
    expect(removeCall).toBeDefined()
  })
})

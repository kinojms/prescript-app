// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import Root from './Root.jsx'

// ---------------------------------------------------------------------------
// Factory for a minimal Audio mock whose play() returns a Promise
// ---------------------------------------------------------------------------

function makeMockAudio() {
  return {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    loop: false,
    preload: '',
    volume: 1,
    currentTime: 0,
    paused: true,
    duration: NaN,
    src: '',
  }
}

beforeEach(() => {
  vi.useFakeTimers()

  // jsdom does not implement matchMedia — provide a minimal stub
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })))

  // Stub Audio constructor — used by App's BGM effect and useCipherDecodeAudio.
  // Must be a real constructor (class or function) so `new Audio(url)` works.
  const MockAudio = vi.fn(function () {
    Object.assign(this, makeMockAudio())
  })
  vi.stubGlobal('Audio', MockAudio)

  // Stub canvas getContext (needed by CipherBackground)
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    setTransform: vi.fn(),
    scale: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    font: '',
    textBaseline: '',
    fillStyle: '',
  }))

  // Stub rAF — return stable id, do NOT auto-invoke (prevents infinite loop)
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 123))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// Helper: simulate the full InitiationPage → onComplete flow
// ---------------------------------------------------------------------------

function advanceThroughInitiation() {
  // Advance past the interactivity gate (2500ms)
  act(() => { vi.advanceTimersByTime(2500) })
  // Click the cipher button
  const btn = screen.getByRole('button', { name: /click to join the index/i })
  act(() => { fireEvent.click(btn) })
  // Advance past fade-out timeout without draining perpetual shuffle intervals.
  act(() => { vi.advanceTimersByTime(1200) })
}

// ---------------------------------------------------------------------------
// Structure — before initiation completes
// ---------------------------------------------------------------------------

describe('Root — before onComplete', () => {
  it('renders InitiationPage initially (cipher button is present)', () => {
    render(<Root />)
    expect(screen.getByRole('button', { name: /click to join the index/i })).not.toBeNull()
  })

  it('App fade-in wrapper is NOT in the DOM before onComplete', () => {
    const { container } = render(<Root />)
    expect(container.querySelector('.app-mount')).toBeNull()
  })

  it('no <audio> element exists before onComplete', () => {
    render(<Root />)
    expect(document.querySelector('audio')).toBeNull()
  })

  it('Audio constructor is not called before onComplete', () => {
    render(<Root />)
    // Advance through interactivity gate (but do NOT click — no onComplete yet)
    act(() => { vi.advanceTimersByTime(2500) })

    // Audio (global stub) should not have been called yet
    expect(Audio).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Structure — after initiation completes
// ---------------------------------------------------------------------------

describe('Root — after onComplete', () => {
  it('unmounts InitiationPage after onComplete (cipher button gone)', () => {
    render(<Root />)
    advanceThroughInitiation()

    expect(screen.queryByRole('button', { name: /click to join the index/i })).toBeNull()
  })

  it('App fade-in wrapper is present after onComplete', () => {
    const { container } = render(<Root />)
    advanceThroughInitiation()

    expect(container.querySelector('.app-mount')).not.toBeNull()
  })

  it('fade-in wrapper has initiation-fade-in animation on its style attribute', () => {
    const { container } = render(<Root />)
    advanceThroughInitiation()

    const wrapper = container.querySelector('.app-mount')
    expect(wrapper).not.toBeNull()
    expect(wrapper.style.animation).toContain('initiation-fade-in')
  })

  it('Audio constructor is called when App mounts (BGM starts at fade-in moment)', () => {
    render(<Root />)
    advanceThroughInitiation()

    expect(Audio).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Switch is toggled exactly once
// ---------------------------------------------------------------------------

describe('Root — switch behavior', () => {
  it('shows InitiationPage first, then App after gate completes', () => {
    const { container } = render(<Root />)

    // Before — InitiationPage visible, App wrapper absent
    expect(screen.getByRole('button', { name: /click to join the index/i })).not.toBeNull()
    expect(container.querySelector('.app-mount')).toBeNull()

    advanceThroughInitiation()

    // After — App wrapper present, InitiationPage gone
    expect(container.querySelector('.app-mount')).not.toBeNull()
    expect(screen.queryByRole('button', { name: /click to join the index/i })).toBeNull()
  })
})

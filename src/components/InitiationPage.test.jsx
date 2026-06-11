// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import InitiationPage from './InitiationPage.jsx'

// ---------------------------------------------------------------------------
// Fake timers + matchMedia stub
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers()

  // jsdom does not implement matchMedia — provide a minimal stub
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false,
    media: '',
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function renderPage(props = {}) {
  const onComplete = props.onComplete ?? vi.fn()
  const utils = render(<InitiationPage onComplete={onComplete} {...props} />)
  return { ...utils, onComplete }
}

function getCipherButton() {
  return screen.getByRole('button', { name: /click to join the index/i })
}

// ---------------------------------------------------------------------------
// Structure & initial DOM
// ---------------------------------------------------------------------------

describe('InitiationPage — structure', () => {
  it('renders the full-viewport black overlay', () => {
    renderPage()
    const root = document.querySelector('[class*="fixed"][class*="inset-0"][class*="z-50"]')
    expect(root).not.toBeNull()
  })

  it('renders a sigil element', () => {
    renderPage()
    // aria-hidden sigil is present
    const sigil = document.querySelector('img[alt="Index Prescript"]')
    expect(sigil).not.toBeNull()
  })

  it('renders the doctrine quote', () => {
    renderPage()
    expect(screen.getByText(/will of the city/i)).not.toBeNull()
  })

  it('renders the cipher button', () => {
    renderPage()
    expect(getCipherButton()).not.toBeNull()
  })

  it('cipher button has aria-label "Click to join the Index."', () => {
    renderPage()
    const btn = getCipherButton()
    expect(btn.getAttribute('aria-label')).toBe('Click to join the Index.')
  })

  it('doctrine quote has cream color', () => {
    renderPage()
    const quote = screen.getByText(/will of the city/i)
    expect(quote.style.color).toBe('var(--hermes-base)')
  })

  it('sigil is an img element', () => {
    renderPage()
    const sigil = document.querySelector('img[alt="Index Prescript"]')
    expect(sigil).not.toBeNull()
    expect(sigil.tagName).toBe('IMG')
  })
})

// ---------------------------------------------------------------------------
// Animation delays (timed reveal)
// ---------------------------------------------------------------------------

describe('InitiationPage — animation delays (US-1)', () => {
  it('sigil animation-delay is 0s', () => {
    renderPage()
    const sigil = document.querySelector('img[alt="Index Prescript"]')
    expect(sigil.style.animationDelay).toBe('0s')
  })

  it('doctrine quote animation-delay is 1s', () => {
    renderPage()
    const quote = screen.getByText(/will of the city/i)
    expect(quote.style.animationDelay).toBe('1s')
  })

  it('cipher line animation-delay is 2.5s', () => {
    renderPage()
    const btn = getCipherButton()
    expect(btn.style.animationDelay).toBe('2.5s')
  })

  it('all three elements have initiation-fade-in in their animation style', () => {
    renderPage()
    const sigil = document.querySelector('img[alt="Index Prescript"]')
    const quote = screen.getByText(/will of the city/i)
    const btn = getCipherButton()
    expect(sigil.style.animation).toContain('initiation-fade-in')
    expect(quote.style.animation).toContain('initiation-fade-in')
    expect(btn.style.animation).toContain('initiation-fade-in')
  })
})

// ---------------------------------------------------------------------------
// Interactivity gate (US-2)
// ---------------------------------------------------------------------------

describe('InitiationPage — cipher gate (US-2)', () => {
  it('cipher button has pointer-events:none before T=2500ms', () => {
    renderPage()
    const btn = getCipherButton()
    expect(btn.style.pointerEvents).toBe('none')
  })

  it('cipher button has pointer-events:auto after T=2500ms', () => {
    renderPage()
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    const btn = getCipherButton()
    expect(btn.style.pointerEvents).toBe('auto')
  })

  it('hover (mouseenter) triggers reveal after T=2500ms', () => {
    renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    const btn = getCipherButton()
    act(() => { fireEvent.mouseEnter(btn) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(btn.textContent).toBe('Click to join the Index.')
  })

  it('mouseleave after reveal reverts text to non-target', () => {
    renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    const btn = getCipherButton()
    act(() => { fireEvent.mouseEnter(btn) })
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { fireEvent.mouseLeave(btn) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(btn.textContent).not.toBe('Click to join the Index.')
  })

  it('touch: pointerdown(touch) triggers reveal', () => {
    renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    const btn = getCipherButton()
    act(() => { fireEvent.pointerDown(btn, { pointerType: 'touch' }) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(btn.textContent).toBe('Click to join the Index.')
  })

  it('touch: pointerup conceals', () => {
    renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    const btn = getCipherButton()
    act(() => { fireEvent.pointerDown(btn, { pointerType: 'touch' }) })
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { fireEvent.pointerUp(btn, { pointerType: 'touch' }) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(btn.textContent).not.toBe('Click to join the Index.')
  })

  it('touch: pointercancel conceals', () => {
    renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    const btn = getCipherButton()
    act(() => { fireEvent.pointerDown(btn, { pointerType: 'touch' }) })
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { fireEvent.pointerCancel(btn, { pointerType: 'touch' }) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(btn.textContent).not.toBe('Click to join the Index.')
  })

  it('click before T=2500ms does NOT call onComplete', () => {
    const { onComplete } = renderPage()
    const btn = getCipherButton()
    act(() => { fireEvent.click(btn) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onComplete).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Click-through (US-3)
// ---------------------------------------------------------------------------

describe('InitiationPage — click-through (US-3)', () => {
  it('click after T=2500ms triggers onComplete after fade-out timeout', () => {
    const { onComplete } = renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    const btn = getCipherButton()
    act(() => { fireEvent.click(btn) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('onComplete is called exactly once even if multiple clicks fire', () => {
    const { onComplete } = renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    const btn = getCipherButton()
    act(() => {
      fireEvent.click(btn)
      fireEvent.click(btn)
      fireEvent.click(btn)
    })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('click works while cipher text is mid-resolve (partial cipher state)', () => {
    const { onComplete } = renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    const btn = getCipherButton()
    // Trigger reveal partway through
    act(() => { fireEvent.mouseEnter(btn) })
    act(() => { vi.advanceTimersByTime(90) }) // partial resolve
    // Click without full resolve
    act(() => { fireEvent.click(btn) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('applies fade-out animation when clicking', () => {
    renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    const btn = getCipherButton()
    act(() => { fireEvent.click(btn) })
    const content = screen.getByTestId('initiation-content')
    expect(content.style.animation).toContain('initiation-fade-out')
  })
})

// ---------------------------------------------------------------------------
// No audio (US-1.5, US-4.1)
// ---------------------------------------------------------------------------

describe('InitiationPage — no audio', () => {
  it('no <audio> element is rendered', () => {
    renderPage()
    expect(document.querySelector('audio')).toBeNull()
  })

  it('Audio constructor is never called', () => {
    const AudioSpy = vi.fn()
    vi.stubGlobal('Audio', AudioSpy)
    renderPage()
    act(() => { vi.advanceTimersByTime(5000) })
    expect(AudioSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// prefers-reduced-motion (US-1.6, US-2.7, US-3.7)
// ---------------------------------------------------------------------------

describe('InitiationPage — prefers-reduced-motion', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))
  })

  it('all three elements are present (still appear)', () => {
    renderPage()
    expect(document.querySelector('img[alt="Index Prescript"]')).not.toBeNull()
    expect(screen.getByText(/will of the city/i)).not.toBeNull()
    expect(getCipherButton()).not.toBeNull()
  })

  it('cipher still gates at 2.5s with reduced motion', () => {
    renderPage()
    expect(getCipherButton().style.pointerEvents).toBe('none')
    act(() => { vi.advanceTimersByTime(2500) })
    expect(getCipherButton().style.pointerEvents).toBe('auto')
  })

  it('hover with reduced motion instantly resolves to target', () => {
    renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    const btn = getCipherButton()
    act(() => { fireEvent.mouseEnter(btn) })
    // With reduced=true, no timers needed — synchronous resolve
    expect(btn.textContent).toBe('Click to join the Index.')
  })

  it('click still triggers onComplete with reduced motion', () => {
    const { onComplete } = renderPage()
    act(() => { vi.advanceTimersByTime(2500) })
    act(() => { fireEvent.click(getCipherButton()) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Resize does not reset the interactivity timer (US-1 edge case)
// ---------------------------------------------------------------------------

describe('InitiationPage — resize does not reset timer', () => {
  it('cipher is interactive after 2.5s even if window resize fires mid-sequence', () => {
    renderPage()
    act(() => { vi.advanceTimersByTime(1200) })
    act(() => { fireEvent(window, new Event('resize')) })
    act(() => { vi.advanceTimersByTime(1300) })
    expect(getCipherButton().style.pointerEvents).toBe('auto')
  })
})

// ---------------------------------------------------------------------------
// Import isolation (US-4.2/4.3)
// ---------------------------------------------------------------------------

describe('InitiationPage — import isolation', () => {
  it('does not import main-app modules', () => {
    const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)))
    const src = readFileSync(path.join(dir, 'InitiationPage.jsx'), 'utf8')

    const forbidden = [
      'App',
      'useAppState',
      'HermesShell',
      'CipherBackground',
      'RankHeader',
      'PrescriptCard',
      'RecordPanel',
      'SettingsDrawer',
    ]

    for (const module of forbidden) {
      // Check that no import statement imports this module name
      const importRegex = new RegExp(`import[^'"\`]*['"\`][^'"\`]*${module}`)
      expect(importRegex.test(src), `should not import ${module}`).toBe(false)
    }
  })
})


// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCipherReveal } from './useCipherReveal.js'

const TARGET = 'Click to join the Index.'

function renderReveal(target = TARGET, reduced = false) {
  return renderHook(() => useCipherReveal(target, reduced))
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useCipherReveal — initial state', () => {
  it('displayText starts as a scrambled frame of the same length as target', () => {
    const { result } = renderReveal()
    expect(result.current.displayText).toHaveLength(TARGET.length)
    expect(result.current.displayText).not.toBe(TARGET)
  })

  it('spaces in target are preserved in the initial scrambled frame', () => {
    const { result } = renderReveal()
    const display = result.current.displayText
    TARGET.split('').forEach((char, i) => {
      if (char === ' ') {
        expect(display[i]).toBe(' ')
      }
    })
  })
})

describe('useCipherReveal — reveal()', () => {
  it('after running all timers, displayText equals target exactly', () => {
    const { result } = renderReveal()

    act(() => {
      result.current.reveal()
    })
    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.displayText).toBe(TARGET)
  })

  it('no timers remain after reveal completes', () => {
    const { result } = renderReveal()

    act(() => {
      result.current.reveal()
    })
    act(() => {
      vi.runAllTimers()
    })

    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('useCipherReveal — conceal()', () => {
  it('after conceal from a fully-revealed state, displayText !== target', () => {
    const { result } = renderReveal()

    act(() => {
      result.current.reveal()
    })
    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.displayText).toBe(TARGET)

    act(() => {
      result.current.conceal()
    })
    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.displayText).not.toBe(TARGET)
    expect(result.current.displayText).toHaveLength(TARGET.length)
  })

  it('spaces are preserved in the concealed frame', () => {
    const { result } = renderReveal()

    act(() => {
      result.current.reveal()
    })
    act(() => {
      vi.runAllTimers()
    })
    act(() => {
      result.current.conceal()
    })
    act(() => {
      vi.runAllTimers()
    })

    const display = result.current.displayText
    TARGET.split('').forEach((char, i) => {
      if (char === ' ') {
        expect(display[i]).toBe(' ')
      }
    })
  })

  it('no timers remain after conceal completes', () => {
    const { result } = renderReveal()

    act(() => {
      result.current.reveal()
    })
    act(() => {
      vi.runAllTimers()
    })
    act(() => {
      result.current.conceal()
    })
    act(() => {
      vi.runAllTimers()
    })

    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('useCipherReveal — interruptibility (US-2.5)', () => {
  it('calling reveal then conceal mid-flight leaves only one active interval', () => {
    const { result } = renderReveal()

    act(() => {
      result.current.reveal()
    })

    // Advance partway through resolve
    act(() => {
      vi.advanceTimersByTime(90)
    })

    // Interrupt with conceal — first interval must be cleared
    act(() => {
      result.current.conceal()
    })

    expect(vi.getTimerCount()).toBe(1)
  })

  it('after reveal-then-conceal runs to completion, no timers remain', () => {
    const { result } = renderReveal()

    act(() => {
      result.current.reveal()
    })
    act(() => {
      vi.advanceTimersByTime(90)
    })
    act(() => {
      result.current.conceal()
    })
    act(() => {
      vi.runAllTimers()
    })

    expect(vi.getTimerCount()).toBe(0)
  })

  it('calling conceal mid-resolve causes already-resolved chars to scramble back', () => {
    const { result } = renderReveal()

    act(() => {
      result.current.reveal()
    })
    // Advance enough for some chars to resolve
    act(() => {
      vi.advanceTimersByTime(200)
    })

    const midReveal = result.current.displayText

    act(() => {
      result.current.conceal()
    })
    act(() => {
      vi.runAllTimers()
    })

    // After full conceal, the text should not be what it was mid-reveal
    expect(result.current.displayText).not.toBe(midReveal)
    expect(result.current.displayText).not.toBe(TARGET)
    expect(result.current.displayText).toHaveLength(TARGET.length)
  })
})

describe('useCipherReveal — prefers-reduced-motion (US-2.7)', () => {
  it('with reduced=true, reveal() sets displayText = target synchronously', () => {
    const { result } = renderReveal(TARGET, true)

    act(() => {
      result.current.reveal()
    })

    // No timer advance needed — should already be resolved
    expect(result.current.displayText).toBe(TARGET)
  })

  it('with reduced=true, no interval is started on reveal', () => {
    const { result } = renderReveal(TARGET, true)

    act(() => {
      result.current.reveal()
    })

    expect(vi.getTimerCount()).toBe(0)
  })

  it('with reduced=true, conceal() sets a scrambled frame synchronously', () => {
    const { result } = renderReveal(TARGET, true)

    act(() => {
      result.current.reveal()
    })
    act(() => {
      result.current.conceal()
    })

    expect(result.current.displayText).not.toBe(TARGET)
    expect(result.current.displayText).toHaveLength(TARGET.length)
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('useCipherReveal — cleanup on unmount', () => {
  it('no timers remain after unmount while reveal is in progress', () => {
    const { result, unmount } = renderReveal()

    act(() => {
      result.current.reveal()
    })

    // Interval is running — unmount should clear it
    act(() => {
      unmount()
    })

    expect(vi.getTimerCount()).toBe(0)
  })

  it('no timers remain after unmount while conceal is in progress', () => {
    const { result, unmount } = renderReveal()

    act(() => {
      result.current.reveal()
    })
    act(() => {
      vi.runAllTimers()
    })
    act(() => {
      result.current.conceal()
    })

    act(() => {
      unmount()
    })

    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('useCipherReveal — no audio', () => {
  it('never constructs an Audio object', () => {
    const AudioSpy = vi.fn()
    vi.stubGlobal('Audio', AudioSpy)

    const { result } = renderReveal()
    act(() => {
      result.current.reveal()
    })
    act(() => {
      vi.runAllTimers()
    })
    act(() => {
      result.current.conceal()
    })
    act(() => {
      vi.runAllTimers()
    })

    expect(AudioSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})

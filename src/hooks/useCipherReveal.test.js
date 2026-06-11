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

describe('useCipherReveal - initial state', () => {
  it('starts as scrambled text with matching length', () => {
    const { result } = renderReveal()
    expect(result.current.displayText).toHaveLength(TARGET.length)
    expect(result.current.displayText).not.toBe(TARGET)
  })

  it('keeps a running shuffle interval when reduced motion is off', () => {
    renderReveal()
    expect(vi.getTimerCount()).toBe(1)
  })
})

describe('useCipherReveal - reveal / conceal behavior', () => {
  it('reveal shows the exact target text', () => {
    const { result } = renderReveal()
    act(() => {
      result.current.reveal()
    })
    expect(result.current.displayText).toBe(TARGET)
  })

  it('reveal clears the shuffle interval', () => {
    const { result } = renderReveal()
    act(() => {
      result.current.reveal()
    })
    expect(vi.getTimerCount()).toBe(0)
  })

  it('conceal restarts continuous shuffle and hides target text', () => {
    const { result } = renderReveal()
    act(() => {
      result.current.reveal()
      result.current.conceal()
      vi.advanceTimersByTime(120)
    })
    expect(result.current.displayText).not.toBe(TARGET)
    expect(vi.getTimerCount()).toBe(1)
  })

  it('concealed text keeps changing over time', () => {
    const { result } = renderReveal()
    act(() => {
      result.current.reveal()
      result.current.conceal()
    })
    const first = result.current.displayText
    act(() => {
      vi.advanceTimersByTime(120)
    })
    const second = result.current.displayText
    expect(second).not.toBe(TARGET)
    expect(second).not.toBe(first)
  })
})

describe('useCipherReveal - prefers-reduced-motion', () => {
  it('does not start a shuffle interval when reduced motion is on', () => {
    renderReveal(TARGET, true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('reveal and conceal switch text synchronously when reduced motion is on', () => {
    const { result } = renderReveal(TARGET, true)
    act(() => {
      result.current.reveal()
    })
    expect(result.current.displayText).toBe(TARGET)
    act(() => {
      result.current.conceal()
    })
    expect(result.current.displayText).not.toBe(TARGET)
    expect(result.current.displayText).toHaveLength(TARGET.length)
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('useCipherReveal - cleanup', () => {
  it('clears running shuffle interval on unmount', () => {
    const { unmount } = renderReveal()
    expect(vi.getTimerCount()).toBe(1)
    act(() => {
      unmount()
    })
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('useCipherReveal - no audio side effects', () => {
  it('never constructs Audio', () => {
    const AudioSpy = vi.fn()
    vi.stubGlobal('Audio', AudioSpy)
    const { result } = renderReveal()
    act(() => {
      result.current.reveal()
      result.current.conceal()
      vi.advanceTimersByTime(150)
    })
    expect(AudioSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})

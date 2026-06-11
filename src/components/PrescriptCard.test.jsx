// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import PrescriptCard from './PrescriptCard.jsx'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

beforeEach(() => {
  vi.useFakeTimers()
})

const samplePresc = { id: 'p1', text: 'Comply with all directives.', difficulty: 'Easy' }

function renderPrescriptCard(prescript = samplePresc, props = {}) {
  const defaults = {
    prescript,
    onExecute: vi.fn(),
    onDiverge: vi.fn(),
    muted: true,
  }
  return render(<PrescriptCard {...defaults} {...props} />)
}

describe('PrescriptCard - directive display', () => {
  it('renders decoded prescript text after decode cycle', () => {
    renderPrescriptCard()

    act(() => {
      vi.advanceTimersByTime(6000)
    })

    expect(screen.getByText('_Comply with all directives._')).toBeTruthy()
  })

  it('renders the difficulty tag', () => {
    renderPrescriptCard()
    expect(screen.getByText(/easy/i)).toBeTruthy()
  })

  it('renders "Hard" difficulty when prescript difficulty is Hard', () => {
    renderPrescriptCard({ ...samplePresc, difficulty: 'Hard' })
    expect(screen.getByText(/hard/i)).toBeTruthy()
  })

  it('renders fallback text when prescript is null', () => {
    renderPrescriptCard(null)
    expect(screen.getByText(/no directive available/i)).toBeTruthy()
  })

  it('shows decoding indicator while reveal is in progress', () => {
    renderPrescriptCard()
    expect(screen.getByText(/decoding/i)).toBeTruthy()
  })
})

describe('PrescriptCard - action buttons', () => {
  it('renders an Execute button', () => {
    renderPrescriptCard()
    expect(screen.getByRole('button', { name: /execute/i })).toBeTruthy()
  })

  it('renders a Diverge button', () => {
    renderPrescriptCard()
    expect(screen.getByRole('button', { name: /diverge/i })).toBeTruthy()
  })

  it('Execute button has checkmark', () => {
    renderPrescriptCard()
    const btn = screen.getByRole('button', { name: /execute/i })
    expect(btn.textContent).toContain('âœ“')
  })

  it('Diverge button has cross', () => {
    renderPrescriptCard()
    const btn = screen.getByRole('button', { name: /diverge/i })
    expect(btn.textContent).toContain('âœ—')
  })

  it('calls onExecute when Execute button is clicked', () => {
    const onExecute = vi.fn()
    renderPrescriptCard(samplePresc, { onExecute })
    fireEvent.click(screen.getByRole('button', { name: /execute/i }))
    expect(onExecute).toHaveBeenCalledTimes(1)
  })

  it('calls onDiverge when Diverge button is clicked', () => {
    const onDiverge = vi.fn()
    renderPrescriptCard(samplePresc, { onDiverge })
    fireEvent.click(screen.getByRole('button', { name: /diverge/i }))
    expect(onDiverge).toHaveBeenCalledTimes(1)
  })

  it('Execute button is disabled when prescript is null', () => {
    renderPrescriptCard(null)
    const btn = screen.getByRole('button', { name: /execute/i })
    expect(btn.disabled).toBe(true)
  })

  it('Diverge button is disabled when prescript is null', () => {
    renderPrescriptCard(null)
    const btn = screen.getByRole('button', { name: /diverge/i })
    expect(btn.disabled).toBe(true)
  })

  it('Execute button is enabled when prescript is provided', () => {
    renderPrescriptCard()
    const btn = screen.getByRole('button', { name: /execute/i })
    expect(btn.disabled).toBe(false)
  })

  it('Diverge button is enabled when prescript is provided', () => {
    renderPrescriptCard()
    const btn = screen.getByRole('button', { name: /diverge/i })
    expect(btn.disabled).toBe(false)
  })
})

describe('PrescriptCard - structure and CSS classes', () => {
  it('renders a section element', () => {
    const { container } = renderPrescriptCard()
    expect(container.querySelector('section')).toBeTruthy()
  })

  it('Execute button has min-h-11 class (44px tap target)', () => {
    renderPrescriptCard()
    const btn = screen.getByRole('button', { name: /execute/i })
    expect(btn.className).toContain('min-h-11')
  })

  it('Diverge button has min-h-11 class (44px tap target)', () => {
    renderPrescriptCard()
    const btn = screen.getByRole('button', { name: /diverge/i })
    expect(btn.className).toContain('min-h-11')
  })
})

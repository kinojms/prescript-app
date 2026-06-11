// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RankHeader from './RankHeader.jsx'

afterEach(() => {
  cleanup()
})

function renderRankHeader(props = {}) {
  const defaults = {
    rank: 'Proselyte',
    trust: 0,
    mode: 'dark',
    onToggleMode: vi.fn(),
    onOpenSettings: vi.fn(),
  }
  return render(<RankHeader {...defaults} {...props} />)
}

describe('RankHeader - text rendering', () => {
  it('displays the rank name', () => {
    renderRankHeader({ rank: 'Proxy' })
    expect(screen.getByText(/proxy/i)).toBeTruthy()
  })

  it('displays the trust value', () => {
    renderRankHeader({ trust: 42 })
    expect(screen.getByText(/42 trust/i)).toBeTruthy()
  })

  it('renders "Max Rank" text when at the final rank', () => {
    renderRankHeader({ rank: 'Grace of the Prescript', trust: 999 })
    expect(screen.getByText(/max rank/i)).toBeTruthy()
  })

  it('shows a progress bar when there is a next rank', () => {
    renderRankHeader({ rank: 'Proselyte', trust: 50 })
    expect(screen.getByRole('progressbar')).toBeTruthy()
  })

  it('does not show a progress bar at max rank', () => {
    renderRankHeader({ rank: 'Grace of the Prescript', trust: 999 })
    const progressbars = document.querySelectorAll('[role="progressbar"]')
    expect(progressbars).toHaveLength(0)
  })
})

describe('RankHeader - action buttons', () => {
  it('renders a settings button', () => {
    renderRankHeader()
    expect(screen.getByRole('button', { name: /open settings/i })).toBeTruthy()
  })

  it('renders a mode toggle button', () => {
    renderRankHeader()
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeTruthy()
  })

  it('mode button label changes for light mode', () => {
    renderRankHeader({ mode: 'light' })
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeTruthy()
  })

  it('calls onToggleMode when mode button is clicked', async () => {
    const onToggleMode = vi.fn()
    renderRankHeader({ onToggleMode })

    await userEvent.click(screen.getByRole('button', { name: /switch to light mode/i }))
    expect(onToggleMode).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenSettings when settings button is clicked', async () => {
    const onOpenSettings = vi.fn()
    renderRankHeader({ onOpenSettings })

    await userEvent.click(screen.getByRole('button', { name: /open settings/i }))
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })
})

describe('RankHeader - structure', () => {
  it('renders a header element', () => {
    const { container } = renderRankHeader()
    expect(container.querySelector('header')).toBeTruthy()
  })

  it('settings and mode buttons keep 44px minimum touch target', () => {
    renderRankHeader()
    const settingsButton = screen.getByRole('button', { name: /open settings/i })
    const modeButton = screen.getByRole('button', { name: /switch to light mode/i })

    expect(settingsButton.className).toContain('min-h-11')
    expect(modeButton.className).toContain('min-h-11')
  })
})

// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import RecordPanel from './RecordPanel.jsx'

afterEach(() => {
  cleanup()
})

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const successEntry = {
  id: 'e1',
  prescriptId: 'p1',
  text: 'Comply with all directives.',
  difficulty: 'Easy',
  outcome: 'success',
  timestamp: new Date('2026-06-11T10:00:00Z').getTime(),
}

const failEntry = {
  id: 'e2',
  prescriptId: 'p2',
  text: 'Reject the heresy.',
  difficulty: 'Hard',
  outcome: 'fail',
  timestamp: new Date('2026-06-11T11:00:00Z').getTime(),
}

// ---------------------------------------------------------------------------
describe('RecordPanel — empty state', () => {
  it('renders "Record of Orders" heading', () => {
    render(<RecordPanel history={[]} />)
    expect(screen.getByText(/record of orders/i)).toBeTruthy()
  })

  it('renders "No orders recorded." when history is empty', () => {
    render(<RecordPanel history={[]} />)
    expect(screen.getByText(/no orders recorded/i)).toBeTruthy()
  })

  it('renders "No orders recorded." when history is undefined', () => {
    render(<RecordPanel />)
    expect(screen.getByText(/no orders recorded/i)).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
describe('RecordPanel — entry rendering', () => {
  it('renders a list item for each history entry', () => {
    render(<RecordPanel history={[successEntry, failEntry]} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
  })

  it('renders the prescript text for each entry', () => {
    render(<RecordPanel history={[successEntry, failEntry]} />)
    expect(screen.getByText('_Comply with all directives._')).toBeTruthy()
    expect(screen.getByText('_Reject the heresy._')).toBeTruthy()
  })

  it('renders ✓ icon for success entries', () => {
    render(<RecordPanel history={[successEntry]} />)
    const item = screen.getByRole('listitem')
    expect(item.textContent).toContain('✓')
  })

  it('renders ✗ icon for fail entries', () => {
    render(<RecordPanel history={[failEntry]} />)
    const item = screen.getByRole('listitem')
    expect(item.textContent).toContain('✗')
  })

  it('renders a <time> element with a valid dateTime attribute for each entry', () => {
    const { container } = render(<RecordPanel history={[successEntry]} />)
    const timeEl = container.querySelector('time')
    expect(timeEl).toBeTruthy()
    // dateTime should be a non-empty ISO string
    expect(timeEl.getAttribute('dateTime')).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('success entry has emerald color class', () => {
    render(<RecordPanel history={[successEntry]} />)
    const item = screen.getByRole('listitem')
    expect(item.className).toContain('emerald')
  })

  it('fail entry has rose color class', () => {
    render(<RecordPanel history={[failEntry]} />)
    const item = screen.getByRole('listitem')
    expect(item.className).toContain('rose')
  })

  it('shows live distortion warning when active', () => {
    render(
      <RecordPanel
        history={[failEntry]}
        liveDistortion={{
          active: true,
          failCount: 5,
          message: 'Distortion Warning: Deviation levels critical. The Proxies have been dispatched.',
        }}
      />
    )
    expect(screen.getByText(/distortion warning/i)).toBeTruthy()
    expect(screen.getByText(/deviation count: 5/i)).toBeTruthy()
  })

  it('hides distorting evaluation warning once history is cleared after conclude day', () => {
    render(
      <RecordPanel
        history={[]}
        evaluation={{
          status: 'distorting',
          message: 'Distortion Warning: Deviation levels critical. The Proxies have been dispatched.',
        }}
      />
    )

    expect(screen.queryByText(/distortion warning/i)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
describe('RecordPanel — structure', () => {
  it('renders a <section> element', () => {
    const { container } = render(<RecordPanel history={[]} />)
    expect(container.querySelector('section')).toBeTruthy()
  })

  it('scrollable container has flex-1 class', () => {
    const { container } = render(<RecordPanel history={[successEntry]} />)
    const scrollable = container.querySelector('.flex-1')
    expect(scrollable).toBeTruthy()
  })

  it('list container does not have its own overflow-y-auto (App.jsx wrapper owns scrolling)', () => {
    const { container } = render(<RecordPanel history={[successEntry]} />)
    const listContainer = container.querySelector('.flex-1')
    expect(listContainer?.classList.contains('overflow-y-auto')).toBe(false)
  })

  it('entries are in a <ul> list', () => {
    const { container } = render(<RecordPanel history={[successEntry]} />)
    expect(container.querySelector('ul')).toBeTruthy()
  })
})

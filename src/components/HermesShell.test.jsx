// @vitest-environment jsdom
//
// NOTE: jsdom has no layout engine. These tests verify CSS class presence and DOM
// structure only — they do NOT assert actual pixel dimensions, viewport overflow,
// or scroll behaviour. Those properties require manual browser/device testing.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import HermesShell from './HermesShell.jsx'

afterEach(() => {
  cleanup()
})

describe('HermesShell — children', () => {
  it('renders children inside the shell', () => {
    render(
      <HermesShell>
        <div data-testid="child" />
      </HermesShell>
    )
    expect(screen.getByTestId('child')).toBeTruthy()
  })
})

describe('HermesShell — dvh retention (REQ-001)', () => {
  it('outer wrapper uses h-dvh to preserve dynamic viewport height on mobile', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const outerWrapper = container.firstChild
    expect(outerWrapper.className).toContain('h-dvh')
  })
})

describe('HermesShell — desktop layout preservation', () => {
  it('inner shell keeps md:max-h-[88vh] for desktop height constraint', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const innerShell = container.firstChild.firstChild
    expect(innerShell.className).toContain('md:max-h-[88vh]')
  })

  it('inner shell keeps md:rounded-2xl for desktop rounding', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const innerShell = container.firstChild.firstChild
    expect(innerShell.className).toContain('md:rounded-2xl')
  })

  it('inner shell keeps md:overflow-hidden for desktop clipping', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const innerShell = container.firstChild.firstChild
    expect(innerShell.className).toContain('md:overflow-hidden')
  })

  it('inner shell keeps md:max-w-4xl for desktop max-width', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const innerShell = container.firstChild.firstChild
    expect(innerShell.className).toContain('md:max-w-4xl')
  })
})

describe('HermesShell — mobile bounded shell', () => {
  it('inner shell has border-2 for full border on mobile', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const innerShell = container.firstChild.firstChild
    expect(innerShell.className).toContain('border-2')
  })

  it('inner shell has rounded-2xl for rounded corners on mobile', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const innerShell = container.firstChild.firstChild
    expect(innerShell.className).toContain('rounded-2xl')
  })

  it('inner shell has overflow-hidden to clip content within the mobile frame', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const innerShell = container.firstChild.firstChild
    expect(innerShell.className).toContain('overflow-hidden')
  })
})

describe('HermesShell — outer wrapper centering and padding (mobile gap)', () => {
  it('outer wrapper has items-center for vertical centering', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const outerWrapper = container.firstChild
    expect(outerWrapper.className).toContain('items-center')
  })

  it('outer wrapper has justify-center for horizontal centering', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const outerWrapper = container.firstChild
    expect(outerWrapper.className).toContain('justify-center')
  })

  it('outer wrapper has p-3 padding creating tasteful gap around shell on mobile', () => {
    const { container } = render(<HermesShell><div /></HermesShell>)
    const outerWrapper = container.firstChild
    expect(outerWrapper.className).toContain('p-3')
  })
})

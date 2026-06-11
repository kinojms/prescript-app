// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsDrawer from './SettingsDrawer.jsx'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

function renderDrawer(props = {}) {
  const defaults = {
    open: true,
    onClose: vi.fn(),
    settings: {
      mode: 'dark',
      muted: false,
      useDefault: true,
      useCustom: true,
      theme: 'default',
    },
    setMode: vi.fn(),
    setMuted: vi.fn(),
    setSources: vi.fn(),
    customPrescripts: [{ id: 'c1', text: 'Hydrate', difficulty: 'Easy' }],
    addCustomPrescript: vi.fn(),
    deleteCustomPrescript: vi.fn(),
    exportBackup: vi.fn(),
    importBackup: vi.fn().mockResolvedValue({ ok: true }),
  }

  const merged = { ...defaults, ...props }
  return {
    ...render(<SettingsDrawer {...merged} />),
    props: merged,
  }
}

describe('SettingsDrawer', () => {
  it('calls onClose when backdrop is clicked', async () => {
    const { props } = renderDrawer()

    await userEvent.click(screen.getByTestId('settings-backdrop'))
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape key', async () => {
    const { props } = renderDrawer()

    await userEvent.keyboard('{Escape}')
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  it('adds custom prescript using text and selected difficulty', async () => {
    const { props } = renderDrawer({ customPrescripts: [] })

    await userEvent.type(screen.getByPlaceholderText(/add custom directive/i), '  Stretch  ')
    await userEvent.selectOptions(screen.getByLabelText(/custom prescript difficulty/i), 'Hard')
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }))

    expect(props.addCustomPrescript).toHaveBeenCalledWith('  Stretch  ', 'Hard')
  })

  it('requires inline confirmation before deleting custom prescript', async () => {
    const { props } = renderDrawer()

    await userEvent.click(screen.getByRole('button', { name: /delete hydrate/i }))
    expect(screen.getByText(/confirm deletion\?/i)).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: /^yes$/i }))
    expect(props.deleteCustomPrescript).toHaveBeenCalledWith('c1')
  })

  it('source toggles call setSources and prevent both-off uncheck', async () => {
    const { props: normalProps } = renderDrawer()

    await userEvent.click(screen.getByLabelText(/use default prescripts/i))
    expect(normalProps.setSources).toHaveBeenCalledWith(false, true)

    cleanup()

    renderDrawer({
      settings: {
        mode: 'dark',
        muted: false,
        useDefault: true,
        useCustom: false,
        theme: 'default',
      },
    })

    const defaultCheckbox = screen.getByLabelText(/use default prescripts/i)
    expect(defaultCheckbox.disabled).toBe(true)
  })

  it('export triggers exportBackup and import uses confirm + importBackup', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const file = new File(['{"currentRank":"Proselyte","accumulatedTrust":0,"history":[],"customPrescripts":[]}'], 'backup.json', { type: 'application/json' })
    const { props } = renderDrawer({ importBackup: vi.fn().mockResolvedValue({ ok: true }) })

    await userEvent.click(screen.getByRole('button', { name: /export record of orders/i }))
    expect(props.exportBackup).toHaveBeenCalledTimes(1)

    await userEvent.upload(screen.getByLabelText(/import backup file/i), file)
    await userEvent.click(screen.getByRole('button', { name: /restore from backup/i }))

    expect(confirmSpy).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(props.importBackup).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('status').textContent).toMatch(/restored successfully/i)
    })
  })

  it('shows no-file message when restore is clicked without selecting a file', async () => {
    renderDrawer()

    await userEvent.click(screen.getByRole('button', { name: /restore from backup/i }))

    expect(screen.getByRole('status').textContent).toMatch(/choose a backup file first/i)
  })
})

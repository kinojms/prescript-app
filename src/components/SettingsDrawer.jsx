import { useEffect, useState } from 'react'

export default function SettingsDrawer({
  open,
  onClose,
  settings,
  setMode,
  setMuted,
  setBgmMuted,
  setBgmVolume,
  setSources,
  customPrescripts,
  addCustomPrescript,
  deleteCustomPrescript,
  exportBackup,
  importBackup,
}) {
  const [text, setText] = useState('')
  const [difficulty, setDifficulty] = useState('Easy')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const modeLabel = settings.mode === 'dark' ? 'Switch To Light' : 'Switch To Dark'
  const muteLabel = settings.muted ? 'Unmute Audio' : 'Mute Audio'
  const bgmMuted = !!settings.bgmMuted
  const bgmVolume = Number.isFinite(settings.bgmVolume) ? settings.bgmVolume : 0.3

  const disableDefaultToggle = !settings.useCustom && settings.useDefault
  const disableCustomToggle = !settings.useDefault && settings.useCustom

  const handleAddCustom = () => {
    addCustomPrescript(text, difficulty)
    setText('')
    setDifficulty('Easy')
  }

  const handleImport = async () => {
    if (!file) {
      setMessage('Please choose a backup file first.')
      return
    }
    if (!window.confirm('This will overwrite your current local data. Continue?')) {
      return
    }

    const result = await importBackup(file)
    if (result.ok) {
      setMessage('Backup restored successfully.')
      setFile(null)
    } else {
      setMessage(result.error || 'Backup restore failed.')
    }
  }

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        data-testid="settings-backdrop"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Prescript directives settings"
        className={`absolute bottom-0 left-0 right-0 max-h-[90dvh] overflow-y-auto border-t border-stone-300 dark:border-zinc-700 bg-stone-100/95 dark:bg-zinc-950/95 p-4 transition-transform duration-300 md:top-0 md:bottom-0 md:left-auto md:w-[28rem] md:max-w-[100vw] md:border-l md:border-t-0 ${
          open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full md:translate-y-0'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-stone-300 dark:border-zinc-700 pb-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-stone-700 dark:text-stone-300">
            Prescript Directives
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 rounded border border-stone-300 dark:border-zinc-700 bg-stone-200/80 dark:bg-zinc-900/80 font-mono text-xs uppercase tracking-widest"
            aria-label="Close settings"
          >
            Close
          </button>
        </div>

        <section className="mt-4 space-y-2">
          <h3 className="font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Custom Prescripts
          </h3>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add custom directive"
            className="w-full rounded border border-stone-300 dark:border-zinc-700 bg-stone-50/90 dark:bg-zinc-900/80 px-3 py-2 font-mono text-sm text-stone-800 dark:text-stone-200"
          />
          <div className="flex gap-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="min-h-11 flex-1 rounded border border-stone-300 dark:border-zinc-700 bg-stone-50/90 dark:bg-zinc-900/80 px-3 font-mono text-sm text-stone-800 dark:text-stone-200"
              aria-label="Custom prescript difficulty"
            >
              <option value="Easy">Easy</option>
              <option value="Hard">Hard</option>
            </select>
            <button
              type="button"
              onClick={handleAddCustom}
              className="min-h-11 rounded border border-emerald-600/60 px-4 font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {customPrescripts.length === 0 && (
              <li className="font-mono text-xs italic text-stone-600 dark:text-stone-400">
                No custom prescripts yet.
              </li>
            )}
            {customPrescripts.map((item) => (
              <li key={item.id} className="rounded border border-stone-300 dark:border-zinc-700 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm text-stone-800 dark:text-stone-200">{item.text}</p>
                    <p className="font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">{item.difficulty}</p>
                  </div>
                  {pendingDeleteId !== item.id ? (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(item.id)}
                      className="min-h-11 rounded border border-rose-600/60 px-3 font-mono text-xs uppercase tracking-widest text-rose-700 dark:text-rose-400"
                      aria-label={`Delete ${item.text}`}
                    >
                      Delete
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-rose-700 dark:text-rose-400">Confirm deletion?</span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteCustomPrescript(item.id)
                          setPendingDeleteId(null)
                        }}
                        className="min-h-11 rounded border border-rose-600/60 px-2 font-mono text-xs uppercase tracking-widest text-rose-700 dark:text-rose-400"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        className="min-h-11 rounded border border-stone-300 dark:border-zinc-700 px-2 font-mono text-xs uppercase tracking-widest text-stone-700 dark:text-stone-300"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 space-y-2">
          <h3 className="font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Prescript Sources
          </h3>
          <label className="flex min-h-11 items-center gap-2 font-mono text-sm text-stone-800 dark:text-stone-200">
            <input
              type="checkbox"
              checked={settings.useDefault}
              disabled={disableDefaultToggle}
              onChange={(e) => setSources(e.target.checked, settings.useCustom)}
            />
            Use Default Prescripts
          </label>
          <label className="flex min-h-11 items-center gap-2 font-mono text-sm text-stone-800 dark:text-stone-200">
            <input
              type="checkbox"
              checked={settings.useCustom}
              disabled={disableCustomToggle}
              onChange={(e) => setSources(settings.useDefault, e.target.checked)}
            />
            Use Custom Prescripts
          </label>
          <p className="font-mono text-xs text-stone-600 dark:text-stone-400">
            At least one source must remain enabled.
          </p>
        </section>

        <section className="mt-5 space-y-2">
          <h3 className="font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Theme And Mode
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode(settings.mode === 'dark' ? 'light' : 'dark')}
              className="min-h-11 rounded border border-stone-300 dark:border-zinc-700 px-3 font-mono text-xs uppercase tracking-widest text-stone-700 dark:text-stone-300"
            >
              {modeLabel}
            </button>
            <button
              type="button"
              onClick={() => setMuted(!settings.muted)}
              className="min-h-11 rounded border border-stone-300 dark:border-zinc-700 px-3 font-mono text-xs uppercase tracking-widest text-stone-700 dark:text-stone-300"
            >
              {muteLabel}
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="themes-select" className="font-mono text-xs uppercase tracking-widest text-stone-600 dark:text-stone-400">
                Themes
              </label>
              <span className="rounded border border-amber-600/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Coming Soon
              </span>
            </div>
            <select
              id="themes-select"
              disabled
              title="Additional themes unlock at higher ranks."
              className="min-h-11 w-full rounded border border-stone-300 dark:border-zinc-700 bg-stone-200/80 dark:bg-zinc-900/80 px-3 font-mono text-sm text-stone-600 dark:text-stone-400"
            >
              <option>Default</option>
              <option>Scroll</option>
              <option>Paper Strip</option>
            </select>
          </div>
        </section>

        <section className="mt-5 space-y-2">
          <h3 className="font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">
            BGM
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBgmMuted(!bgmMuted)}
              className="min-h-11 rounded border border-stone-300 dark:border-zinc-700 px-3 font-mono text-xs uppercase tracking-widest text-stone-700 dark:text-stone-300"
            >
              {bgmMuted ? 'Unmute BGM' : 'Mute BGM'}
            </button>
            <span className="font-mono text-xs hermes-muted">
              {Math.round(bgmVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(bgmVolume * 100)}
            onChange={(e) => setBgmVolume(Number(e.target.value) / 100)}
            className="w-full accent-[var(--hermes-accent)]"
            aria-label="BGM volume"
          />
        </section>

        <section className="mt-5 space-y-2">
          <h3 className="font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Record Backup
          </h3>
          <button
            type="button"
            onClick={exportBackup}
            className="min-h-11 rounded border border-emerald-600/60 px-3 font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400"
          >
            Export Record Of Orders
          </button>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setMessage('')
            }}
            className="block w-full font-mono text-xs text-stone-700 dark:text-stone-300"
            aria-label="Import backup file"
          />
          <button
            type="button"
            onClick={handleImport}
            className="min-h-11 rounded border border-amber-600/60 px-3 font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400"
          >
            Restore From Backup
          </button>
          {message && (
            <p role="status" className="font-mono text-xs text-stone-700 dark:text-stone-300">
              {message}
            </p>
          )}
        </section>
      </aside>
    </div>
  )
}

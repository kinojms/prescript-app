import { RANKS } from '../lib/rank.js'

/**
 * RankHeader - top band with rank/trust, mode toggle, and settings trigger.
 */
export default function RankHeader({
  rank,
  trust,
  mode,
  bgmMuted = false,
  onToggleMode,
  onToggleBgmMute,
  onOpenSettings,
}) {
  const rankIdx = RANKS.findIndex((r) => r.name === rank)
  const safeIdx = rankIdx === -1 ? 0 : rankIdx
  const currentRankData = RANKS[safeIdx]
  const nextRankData = RANKS[safeIdx + 1]

  let progressPercent = 0
  if (nextRankData && currentRankData.threshold !== Infinity) {
    progressPercent = Math.min(100, Math.round((trust / currentRankData.threshold) * 100))
  } else if (currentRankData.threshold === Infinity) {
    progressPercent = 100
  }

  return (
    <header className="hermes-surface border-b-2 hermes-border px-4 py-3 transition-colors duration-300">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono text-sm uppercase tracking-widest hermes-accent font-semibold truncate">
              {rank}
            </span>
            <span className="font-mono text-xs hermes-text">{trust} Trust</span>
          </div>

          {nextRankData && (
            <div className="mt-1.5 h-1 rounded-full border hermes-border overflow-hidden transition-colors duration-300">
              <div
                className="h-full rounded-full bg-[var(--hermes-accent)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={trust}
                aria-valuemin={0}
                aria-valuemax={currentRankData.threshold}
                aria-label={`Trust progress: ${trust} of ${currentRankData.threshold}`}
              />
            </div>
          )}
          {!nextRankData && (
            <p className="mt-0.5 font-mono text-xs hermes-accent uppercase tracking-wider">Max Rank</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onToggleBgmMute}
            className="min-h-11 rounded border-2 hermes-border hermes-surface px-3 hermes-text font-mono text-xs uppercase tracking-widest transition-colors duration-300 hover:opacity-85 active:opacity-80"
            aria-label={bgmMuted ? 'Unmute BGM' : 'Mute BGM'}
            type="button"
          >
            {bgmMuted ? 'BGM Off' : 'BGM On'}
          </button>
          <button
            onClick={onOpenSettings}
            className="min-h-11 rounded border-2 hermes-border hermes-surface px-3 hermes-text font-mono text-xs uppercase tracking-widest transition-colors duration-300 hover:opacity-85 active:opacity-80"
            aria-label="Open settings"
            type="button"
          >
            Settings
          </button>
          <button
            onClick={onToggleMode}
            className="min-h-11 min-w-11 flex items-center justify-center rounded border-2 hermes-border hermes-surface px-3 hermes-text font-mono text-xs uppercase tracking-widest transition-colors duration-300 hover:opacity-85 active:opacity-80"
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
          >
            {mode === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </header>
  )
}

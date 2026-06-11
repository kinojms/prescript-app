import { useEffect, useMemo, useRef, useState } from 'react'
import { useCipherDecodeAudio } from '../hooks/useCipherDecodeAudio.js'

/**
 * PrescriptCard - active directive panel with cipher decode reveal.
 * props: { prescript, onExecute, onDiverge }
 */
export default function PrescriptCard({
  prescript,
  onExecute,
  onDiverge,
  muted = false,
  sfxVolume = 1,
  timeoutSignal = 0,
}) {
  const [now, setNow] = useState(() => Date.now())
  const timeoutSignalRef = useRef(0)
  const decoratedPrescript = prescript
    ? { ...prescript, text: `_${prescript.text}_` }
    : null
  const { displayText, isDecoding } = useCipherDecodeAudio(decoratedPrescript, !muted, sfxVolume)
  const isTimed = !!prescript?.timeSensitive && Number.isFinite(prescript?.deadlineAt)
  const deadlineDurationMs = Number.isFinite(prescript?.deadlineDurationMs) && prescript.deadlineDurationMs > 0
    ? prescript.deadlineDurationMs
    : 0
  const remainingMs = isTimed ? Math.max(0, prescript.deadlineAt - now) : 0
  const progress = isTimed && deadlineDurationMs > 0
    ? Math.max(0, Math.min(1, remainingMs / deadlineDurationMs))
    : 0
  const timeLabel = useMemo(() => {
    const totalSeconds = Math.ceil(remainingMs / 1000)
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }, [remainingMs])

  useEffect(() => {
    setNow(Date.now())
  }, [prescript?.id, prescript?.deadlineAt])

  useEffect(() => {
    if (!isTimed) return undefined
    if (import.meta.env.MODE === 'test') return undefined
    const interval = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(interval)
  }, [isTimed, prescript?.id, prescript?.deadlineAt])

  useEffect(() => {
    if (!timeoutSignal || timeoutSignalRef.current === timeoutSignal) return
    timeoutSignalRef.current = timeoutSignal
    if (muted || typeof Audio === 'undefined') return

    const message1 = new Audio(`${import.meta.env.BASE_URL}audio/index_message_1.wav`)
    const message2 = new Audio(`${import.meta.env.BASE_URL}audio/index_message_2.wav`)
    message1.volume = Math.max(0, Math.min(1, sfxVolume))
    message2.volume = Math.max(0, Math.min(1, sfxVolume))
    message1.playbackRate = 0.8
    message2.playbackRate = 0.85
    message1.play().catch(() => {})
    setTimeout(() => {
      message2.play().catch(() => {})
    }, 120)
  }, [timeoutSignal, muted, sfxVolume])

  return (
    <section className="flex-1 hermes-panel border-b hermes-border p-4 flex flex-col gap-4 transition-colors duration-300">
      <div className="flex-1 flex flex-col gap-2 justify-center">
        {prescript ? (
          <div key={prescript.id} className="animate-prescript-in">
            <span className="inline-block font-mono text-xs uppercase tracking-widest hermes-accent border hermes-border px-2 py-0.5 rounded mb-3">
              {prescript.difficulty}
            </span>

            <p className="font-mono text-base hermes-text leading-relaxed break-words">
              {displayText}
            </p>
            {isTimed && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
                  <span className="hermes-accent">Time-Sensitive Directive</span>
                  <span className="hermes-accent">{timeLabel}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded bg-[rgb(var(--hermes-accent-rgb)/0.24)]">
                  <div
                    className="h-full bg-[var(--hermes-accent)] transition-[width] duration-200 ease-linear"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {isDecoding && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] hermes-muted">
                Decoding...
              </p>
            )}
          </div>
        ) : (
          <p className="font-mono text-sm hermes-muted italic">No directive available.</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onExecute}
          disabled={!prescript}
          className="min-h-11 flex-1 font-mono text-sm uppercase tracking-widest rounded border hermes-border bg-[var(--hermes-surface)] text-[var(--hermes-success)] transition-colors duration-200 hover:opacity-85 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
          type="button"
          aria-label="Execute directive"
        >
          âœ“ Execute
        </button>
        <button
          onClick={onDiverge}
          disabled={!prescript}
          className="min-h-11 flex-1 font-mono text-sm uppercase tracking-widest rounded border hermes-border bg-[var(--hermes-surface)] text-[var(--hermes-danger)] transition-colors duration-200 hover:opacity-85 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
          type="button"
          aria-label="Diverge from directive"
        >
          âœ— Diverge
        </button>
      </div>
    </section>
  )
}

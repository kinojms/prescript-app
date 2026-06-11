import { useCipherDecodeAudio } from '../hooks/useCipherDecodeAudio.js'

/**
 * PrescriptCard - active directive panel with cipher decode reveal.
 * props: { prescript, onExecute, onDiverge }
 */
export default function PrescriptCard({ prescript, onExecute, onDiverge, muted = false }) {
  const decoratedPrescript = prescript
    ? { ...prescript, text: `_${prescript.text}_` }
    : null
  const { displayText, isDecoding } = useCipherDecodeAudio(decoratedPrescript, !muted)

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

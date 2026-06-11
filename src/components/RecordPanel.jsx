/**
 * RecordPanel - history panel using Hermes palette tokens.
 */
export default function RecordPanel({ history }) {
  const entries = Array.isArray(history) ? history : []

  return (
    <section className="hermes-surface p-4 transition-colors duration-300 border-t-2 hermes-border">
      <h2 className="font-mono text-xs uppercase tracking-widest hermes-muted mb-3 border-b hermes-border pb-2 transition-colors duration-300">
        Record of Orders
      </h2>

      <div className="max-h-64 overflow-y-auto hermes-scrollbar pr-1">
        {entries.length === 0 ? (
          <p className="font-mono text-xs hermes-muted italic py-2">No orders recorded.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {entries.map((entry) => {
              const VALID_OUTCOMES = new Set(['success', 'fail'])
              let outcome = entry.outcome
              if (!VALID_OUTCOMES.has(outcome)) {
                console.warn(
                  `RecordPanel: unexpected entry.outcome ${JSON.stringify(outcome)} for entry ${entry.id}; treating as 'fail'`
                )
                outcome = 'fail'
              }
              const isSuccess = outcome === 'success'
              return (
                <li
                  key={entry.id}
                  className={`flex items-start gap-2 font-mono text-xs py-1.5 border-b hermes-border last:border-b-0 transition-colors duration-300 ${
                    isSuccess
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  <span className="flex-shrink-0 font-bold" aria-hidden="true">
                    {isSuccess ? '✓' : '✗'}
                  </span>

                  <span className="flex-1 min-w-0 hermes-text leading-snug">_{entry.text}_</span>

                  {(() => {
                    const ts = entry.timestamp
                    const valid = typeof ts === 'number' && Number.isFinite(ts)
                    const date = valid ? new Date(ts) : null
                    return date ? (
                      <time dateTime={date.toISOString()} className="flex-shrink-0 hermes-muted text-xs">
                        {date.toLocaleTimeString()}
                      </time>
                    ) : (
                      <time className="flex-shrink-0 hermes-muted text-xs">--</time>
                    )
                  })()}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useCipherReveal } from '../hooks/useCipherReveal.js'

const TARGET = 'Click to join the Index.'
const CIPHER_INTERACTIVE_DELAY_MS = 2500
const FADE_OUT_DURATION_MS = 700

function getReducedMotion() {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function InitiationPage({ onComplete }) {
  const [cipherInteractive, setCipherInteractive] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const completedRef = useRef(false)
  const reduced = getReducedMotion()

  const { displayText, reveal, conceal } = useCipherReveal(TARGET, reduced)

  // One-time interactivity gate: flip after CIPHER_INTERACTIVE_DELAY_MS
  useEffect(() => {
    const id = setTimeout(() => setCipherInteractive(true), CIPHER_INTERACTIVE_DELAY_MS)
    return () => clearTimeout(id)
  }, [])

  // Fade-out completion: call onComplete exactly once
  useEffect(() => {
    if (!fadingOut) return
    const duration = reduced ? 80 : FADE_OUT_DURATION_MS
    const id = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete()
      }
    }, duration)
    return () => clearTimeout(id)
  }, [fadingOut, reduced, onComplete])

  function handleClick() {
    if (!cipherInteractive || fadingOut) return
    setFadingOut(true)
  }

  function handlePointerDown(e) {
    if (e.pointerType === 'touch') reveal()
  }

  function handlePointerUp(e) {
    if (e.pointerType === 'touch') conceal()
  }

  function handlePointerCancel(e) {
    if (e.pointerType === 'touch') conceal()
  }

  const fadeDuration = reduced ? '0.08s' : '0.7s'
  const fadeInDuration = reduced ? '0.08s' : '0.6s'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#000000',
      }}
    >
      <div
        data-testid="initiation-content"
        className="flex w-full max-w-full flex-col items-center justify-center"
        style={{
          animation: fadingOut
            ? `initiation-fade-out ${fadeDuration} ease-in both`
            : undefined,
        }}
      >
        {/* Sigil */}
        <img
          src={`${import.meta.env.BASE_URL}images/The_Index_Logo.png`}
          alt="Index Prescript"
          className="mb-8 select-none"
          style={{
            width: '12rem',
            height: 'auto',
            animation: `initiation-fade-in ${fadeInDuration} ease-out both`,
            animationDelay: '0s',
          }}
          draggable="false"
        />

        {/* Doctrine quote */}
        <p
          className="mb-6 px-8 text-center font-sans text-base md:text-lg"
          style={{
            color: 'var(--hermes-base)',
            animation: `initiation-fade-in ${fadeInDuration} ease-out both`,
            animationDelay: '1s',
          }}
        >
          The Will of the City flows through our hands.
        </p>

        {/* Cipher gate */}
        <button
          type="button"
          className="cursor-pointer select-none font-mono text-base tracking-widest md:text-lg"
          style={{
            color: 'var(--hermes-accent)',
            animation: `initiation-fade-in ${fadeInDuration} ease-out both`,
            animationDelay: '2.5s',
            pointerEvents: cipherInteractive ? 'auto' : 'none',
            background: 'none',
            border: 'none',
            padding: '0.5rem 1rem',
          }}
          onMouseEnter={() => {
            reveal()
          }}
          onMouseLeave={() => {
            conceal()
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={handleClick}
          aria-label="Click to join the Index."
        >
          {displayText}
        </button>
      </div>
    </div>
  )
}

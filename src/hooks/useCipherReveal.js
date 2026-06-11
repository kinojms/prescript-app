import { useCallback, useEffect, useRef, useState } from 'react'
import { buildCipherFrame, SHUFFLE_FRAME_MS } from '../lib/cipher.js'

export function useCipherReveal(target, reduced) {
  const [displayText, setDisplayText] = useState(() => buildCipherFrame(target, 0))
  const intervalRef = useRef(null)
  const resolvedRef = useRef(0)

  const charsPerTick = Math.max(1, Math.ceil(target.length / 12))

  const reveal = useCallback(() => {
    if (reduced) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      resolvedRef.current = target.length
      setDisplayText(target)
      return
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    intervalRef.current = setInterval(() => {
      const nextResolved = Math.min(target.length, resolvedRef.current + charsPerTick)
      resolvedRef.current = nextResolved
      if (nextResolved >= target.length) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setDisplayText(target)
      } else {
        setDisplayText(buildCipherFrame(target, nextResolved))
      }
    }, SHUFFLE_FRAME_MS)
  }, [target, reduced, charsPerTick])

  const conceal = useCallback(() => {
    if (reduced) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      resolvedRef.current = 0
      setDisplayText(buildCipherFrame(target, 0))
      return
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    intervalRef.current = setInterval(() => {
      const nextResolved = Math.max(0, resolvedRef.current - charsPerTick)
      resolvedRef.current = nextResolved
      const frame = buildCipherFrame(target, nextResolved)
      setDisplayText(frame)
      if (nextResolved <= 0) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, SHUFFLE_FRAME_MS)
  }, [target, reduced, charsPerTick])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  return { displayText, reveal, conceal }
}

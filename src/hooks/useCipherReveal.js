import { useCallback, useEffect, useRef, useState } from 'react'
import { buildCipherFrame, SHUFFLE_FRAME_MS } from '../lib/cipher.js'

export function useCipherReveal(target, reduced) {
  const [displayText, setDisplayText] = useState(() => buildCipherFrame(target, 0))
  const intervalRef = useRef(null)
  const clearActiveInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startShuffle = useCallback(() => {
    clearActiveInterval()
    setDisplayText(buildCipherFrame(target, 0))
    if (reduced) return
    intervalRef.current = setInterval(() => {
      setDisplayText(buildCipherFrame(target, 0))
    }, SHUFFLE_FRAME_MS)
  }, [target, reduced, clearActiveInterval])

  const reveal = useCallback(() => {
    clearActiveInterval()
    setDisplayText(target)
  }, [target, clearActiveInterval])

  const conceal = useCallback(() => {
    startShuffle()
  }, [startShuffle])

  useEffect(() => {
    startShuffle()
  }, [startShuffle])

  useEffect(() => {
    return () => {
      clearActiveInterval()
    }
  }, [clearActiveInterval])

  return { displayText, reveal, conceal }
}

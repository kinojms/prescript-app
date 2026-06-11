import { useEffect, useMemo, useRef, useState } from 'react'
import { buildCipherFrame, SHUFFLE_FRAME_MS } from '../lib/cipher.js'

const AUDIO_OVERLAP_OFFSET_MS = 100
const FALLBACK_LOOP_MS = 500

function hasDuration(audio) {
  return !!audio && Number.isFinite(audio.duration) && audio.duration > 0
}

function createAudio(url) {
  if (typeof Audio === 'undefined') return null
  const audio = new Audio(url)
  audio.volume = 1
  return audio
}

export function useCipherDecodeAudio(prescript, audioEnabled = true) {
  const target = prescript?.text ?? ''
  const [resolvedCount, setResolvedCount] = useState(0)
  const [displayText, setDisplayText] = useState(target)
  const resolvedRef = useRef(0)
  const shuffleIntervalRef = useRef(null)
  const message1DelayRef = useRef(null)
  const message2LoopRef = useRef(null)
  const durationPollRef = useRef(null)
  const runningMessage2Ref = useRef([])
  const message1Ref = useRef(null)

  const message1Url = useMemo(
    () => `${import.meta.env.BASE_URL}audio/index_message_1.wav`,
    []
  )
  const message2Url = useMemo(
    () => `${import.meta.env.BASE_URL}audio/index_message_2.wav`,
    []
  )

  const stopAllAudioAndTimers = () => {
    if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current)
    if (message1DelayRef.current) clearTimeout(message1DelayRef.current)
    if (message2LoopRef.current) clearInterval(message2LoopRef.current)
    if (durationPollRef.current) clearTimeout(durationPollRef.current)
    shuffleIntervalRef.current = null
    message1DelayRef.current = null
    message2LoopRef.current = null
    durationPollRef.current = null

    if (message1Ref.current) {
      try {
        message1Ref.current.pause()
        message1Ref.current.currentTime = 0
      } catch {
        // ignore best-effort cleanup failures
      }
    }
    message1Ref.current = null

    for (const audio of runningMessage2Ref.current) {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch {
        // ignore best-effort cleanup failures
      }
    }
    runningMessage2Ref.current = []
  }

  useEffect(() => {
    stopAllAudioAndTimers()

    if (!prescript || !target) {
      resolvedRef.current = 0
      setResolvedCount(0)
      setDisplayText(target)
      return undefined
    }

    resolvedRef.current = 0
    setResolvedCount(0)
    setDisplayText(buildCipherFrame(target, 0))

    const charsPerTick = Math.max(1, Math.ceil(target.length / 12))

    const decodeTick = () => {
      const nextResolved = Math.min(target.length, resolvedRef.current + charsPerTick)
      resolvedRef.current = nextResolved
      setResolvedCount(nextResolved)
      setDisplayText(buildCipherFrame(target, nextResolved))

      if (nextResolved >= target.length && message2LoopRef.current) {
        clearInterval(message2LoopRef.current)
        message2LoopRef.current = null
        for (const audio of runningMessage2Ref.current) {
          audio.pause()
          audio.currentTime = 0
        }
        runningMessage2Ref.current = []
      }
    }

    shuffleIntervalRef.current = setInterval(() => {
      if (resolvedRef.current >= target.length) return
      setDisplayText(buildCipherFrame(target, resolvedRef.current))
    }, SHUFFLE_FRAME_MS)

    if (audioEnabled) {
      message1Ref.current = createAudio(message1Url)
      if (message1Ref.current) {
        message1Ref.current.play().catch(() => {})
      }
    }

    const waitForDuration = (audio, onReady, fallbackMs = FALLBACK_LOOP_MS, attempts = 0) => {
      if (hasDuration(audio)) {
        onReady(audio.duration)
        return
      }
      if (!audio) {
        onReady(fallbackMs / 1000)
        return
      }
      if (attempts >= 20) {
        onReady(fallbackMs / 1000)
        return
      }
      durationPollRef.current = setTimeout(
        () => waitForDuration(audio, onReady, fallbackMs, attempts + 1),
        10
      )
    }

    const startMessage2Loop = () => {
      if (resolvedRef.current >= target.length) return
      const probe = audioEnabled ? createAudio(message2Url) : null
      waitForDuration(probe, (durationSec) => {
        const intervalMs = Math.max(100, (durationSec * 1000) - AUDIO_OVERLAP_OFFSET_MS || FALLBACK_LOOP_MS)

        const playMessage2 = () => {
          const audio = audioEnabled ? createAudio(message2Url) : null
          if (!audio) return
          runningMessage2Ref.current.push(audio)
          audio.addEventListener('ended', () => {
            runningMessage2Ref.current = runningMessage2Ref.current.filter((a) => a !== audio)
          })
          audio.play().catch(() => {})
        }

        playMessage2()
        decodeTick()

        if (resolvedRef.current >= target.length) return

        message2LoopRef.current = setInterval(() => {
          playMessage2()
          decodeTick()
        }, intervalMs)
      })
    }

    waitForDuration(message1Ref.current, (durationSec) => {
      const delayMs = Math.max(0, (durationSec * 1000) - AUDIO_OVERLAP_OFFSET_MS)
      message1DelayRef.current = setTimeout(startMessage2Loop, delayMs)
    }, 0)

    return () => {
      stopAllAudioAndTimers()
    }
  }, [audioEnabled, prescript?.id, message1Url, message2Url, target])

  return {
    displayText,
    isDecoding: !!prescript && resolvedCount < target.length,
    resolvedCount,
    totalCount: target.length,
  }
}

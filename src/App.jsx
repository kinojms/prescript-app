import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAppState } from './hooks/useAppState.js'
import CipherBackground from './components/CipherBackground.jsx'
import HermesShell from './components/HermesShell.jsx'
import RankHeader from './components/RankHeader.jsx'
import PrescriptCard from './components/PrescriptCard.jsx'
import RecordPanel from './components/RecordPanel.jsx'
import SettingsDrawer from './components/SettingsDrawer.jsx'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showTransitionShield, setShowTransitionShield] = useState(true)
  const bgmRef = useRef(null)
  const bgmFadeRef = useRef(null)
  const bgmFadeOutRef = useRef(null)
  const bgmStartedRef = useRef(false)
  const bgmFadingOutRef = useRef(false)
  const bgmMutedRef = useRef(false)
  const bgmVolumeRef = useRef(0.3)
  const bgmVolumeSyncMountedRef = useRef(false)

  const {
    currentRank,
    accumulatedTrust,
    activePrescript,
    execute,
    diverge,
    timeoutSignal,
    concludeDay,
    lastEvaluation,
    liveDistortion,
    distortionOpacity,
    distortionGlitchSignal,
    history,
    settings,
    setMode,
    setMuted,
    setSfxVolume,
    setBgmMuted,
    setBgmVolume,
    setSources,
    customPrescripts,
    addCustomPrescript,
    deleteCustomPrescript,
    exportBackup,
    importBackup,
  } = useAppState()

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', settings.mode === 'dark')
  }, [settings.mode])

  useEffect(() => {
    bgmMutedRef.current = !!settings.bgmMuted
    bgmVolumeRef.current = Math.max(0, Math.min(1, Number(settings.bgmVolume ?? 0.3)))
  }, [settings.bgmMuted, settings.bgmVolume])

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/Limbus Company OST - Shattered Dream.mp3`)
    audio.loop = false
    audio.preload = 'auto'
    audio.volume = 0
    bgmRef.current = audio

    const clearFade = () => {
      if (bgmFadeRef.current) {
        clearInterval(bgmFadeRef.current)
        bgmFadeRef.current = null
      }
    }
    const clearFadeOut = () => {
      if (bgmFadeOutRef.current) {
        clearInterval(bgmFadeOutRef.current)
        bgmFadeOutRef.current = null
      }
    }

    const targetVolume = () => (
      bgmMutedRef.current ? 0 : bgmVolumeRef.current
    )

    const startFadeToTarget = () => {
      clearFade()
      const target = targetVolume()
      if (target <= 0) {
        audio.volume = 0
        return
      }
      const step = target / 20
      bgmFadeRef.current = setInterval(() => {
        audio.volume = Math.min(target, audio.volume + step)
        if (audio.volume >= target) clearFade()
      }, 80)
    }

    const startFadeOutBeforeEnd = () => {
      if (bgmFadingOutRef.current || bgmMutedRef.current) return
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return

      const remainingMs = Math.max(1, (audio.duration - audio.currentTime) * 1000)
      bgmFadingOutRef.current = true
      clearFadeOut()

      const startVolume = audio.volume
      const steps = Math.max(1, Math.floor(remainingMs / 60))
      let tick = 0
      bgmFadeOutRef.current = setInterval(() => {
        tick += 1
        const ratio = Math.min(1, tick / steps)
        audio.volume = Math.max(0, startVolume * (1 - ratio))
        if (ratio >= 1) {
          clearFadeOut()
          bgmFadingOutRef.current = false
          audio.volume = 0
        }
      }, Math.max(20, Math.floor(remainingMs / steps)))
    }

    const startPlayback = () => {
      if (bgmStartedRef.current) return
      bgmStartedRef.current = true
      audio.volume = 0
      audio.play().then(() => {
        startFadeToTarget()
      }).catch(() => {
        bgmStartedRef.current = false
      })
    }

    const onTimeUpdate = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return
      const remaining = audio.duration - audio.currentTime
      if (remaining <= 1.2) {
        startFadeOutBeforeEnd()
      }
    }

    const onEnded = () => {
      clearFadeOut()
      bgmFadingOutRef.current = false
      try {
        audio.currentTime = 0
      } catch {
        // ignore if resetting currentTime fails
      }
      audio.play().then(() => {
        startFadeToTarget()
      }).catch(() => {
        bgmStartedRef.current = false
      })
    }

    startPlayback()
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)

    const resumeOnGesture = () => startPlayback()
    window.addEventListener('pointerdown', resumeOnGesture)
    window.addEventListener('keydown', resumeOnGesture)

    return () => {
      clearFade()
      clearFadeOut()
      bgmFadingOutRef.current = false
      window.removeEventListener('pointerdown', resumeOnGesture)
      window.removeEventListener('keydown', resumeOnGesture)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      try {
        audio.pause()
        audio.currentTime = 0
      } catch {
        // no-op
      }
      bgmRef.current = null
      bgmStartedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!bgmVolumeSyncMountedRef.current) {
      bgmVolumeSyncMountedRef.current = true
      return
    }
    const audio = bgmRef.current
    if (!audio) return

    const target = settings.bgmMuted ? 0 : Math.max(0, Math.min(1, Number(settings.bgmVolume ?? 0.3)))
    if (bgmFadeRef.current) {
      clearInterval(bgmFadeRef.current)
      bgmFadeRef.current = null
    }
    if (bgmFadeOutRef.current) {
      clearInterval(bgmFadeOutRef.current)
      bgmFadeOutRef.current = null
    }
    bgmFadingOutRef.current = false

    if (settings.bgmMuted) {
      audio.volume = 0
      return
    }

    if (audio.paused) {
      audio.play().catch(() => {})
    }
    audio.volume = target
  }, [settings.bgmMuted, settings.bgmVolume])

  const toggleMode = () => setMode(settings.mode === 'dark' ? 'light' : 'dark')
  const toggleBgmMute = () => setBgmMuted(!settings.bgmMuted)

  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const appFadeDuration = reducedMotion ? '0.08s' : '0.6s'
  const transitionShieldDurationMs = reducedMotion ? 80 : 700

  useEffect(() => {
    const id = setTimeout(() => setShowTransitionShield(false), transitionShieldDurationMs)
    return () => clearTimeout(id)
  }, [transitionShieldDurationMs])

  return (
    <>
      {showTransitionShield && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[70] pointer-events-none"
          style={{
            backgroundColor: '#000000',
            animation: `initiation-fade-out ${appFadeDuration} ease-out both`,
          }}
        />
      )}
      <div
        className="app-mount"
        style={{
          animation: `initiation-fade-in ${appFadeDuration} ease-out both`,
          backgroundColor: settings.mode === 'dark' ? '#000000' : 'var(--hermes-base)',
        }}
      >
        <CipherBackground
          distortionOpacity={distortionOpacity}
          distortionGlitchSignal={distortionGlitchSignal}
        />
        <HermesShell>
        <RankHeader
          rank={currentRank}
          trust={accumulatedTrust}
          mode={settings.mode}
          bgmMuted={settings.bgmMuted}
          onToggleMode={toggleMode}
          onToggleBgmMute={toggleBgmMute}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        <PrescriptCard
          prescript={activePrescript}
          onExecute={execute}
          onDiverge={diverge}
          muted={settings.muted}
          sfxVolume={settings.sfxVolume}
          timeoutSignal={timeoutSignal}
        />
        <RecordPanel
          history={history}
          onConcludeDay={() => concludeDay('manual')}
          evaluation={lastEvaluation}
          liveDistortion={liveDistortion}
        />
        </HermesShell>

        <SettingsDrawer
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          setMode={setMode}
          setMuted={setMuted}
          setSfxVolume={setSfxVolume}
          setBgmMuted={setBgmMuted}
          setBgmVolume={setBgmVolume}
          setSources={setSources}
          customPrescripts={customPrescripts}
          addCustomPrescript={addCustomPrescript}
          deleteCustomPrescript={deleteCustomPrescript}
          exportBackup={exportBackup}
          importBackup={importBackup}
        />
      </div>
    </>
  )
}

export default App

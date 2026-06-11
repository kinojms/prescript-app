import { useEffect, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*!?<>/|\\'
const CELL_SIZE = 18
const FRAME_INTERVAL = 50
const CHURN_RATE = 0.05

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

export default function CipherBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let grid = []
    let cols = 0
    let rows = 0
    let rafId = null
    let lastFrameTime = 0

    function glyphColor() {
      return 'rgba(134, 186, 218, 0.5)'
    }

    function initGrid() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)

      cols = Math.ceil(w / CELL_SIZE)
      rows = Math.ceil(h / CELL_SIZE)

      grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => randomChar())
      )
    }

    function draw() {
      const w = window.innerWidth
      const h = window.innerHeight

      ctx.clearRect(0, 0, w, h)

      ctx.font = `${CELL_SIZE - 2}px monospace`
      ctx.textBaseline = 'top'
      ctx.fillStyle = glyphColor()

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillText(grid[r][c], c * CELL_SIZE, r * CELL_SIZE)
        }
      }
    }

    function churn() {
      if (rows <= 0 || cols <= 0) return
      const total = rows * cols
      const count = Math.max(1, Math.round(total * CHURN_RATE))
      for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * rows)
        const c = Math.floor(Math.random() * cols)
        grid[r][c] = randomChar()
      }
    }

    function tick(timestamp) {
      if (document.hidden) {
        rafId = null
        return
      }
      rafId = requestAnimationFrame(tick)
      if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
        lastFrameTime = timestamp
        churn()
        draw()
      }
    }

    function startLoop() {
      if (rafId !== null) return
      rafId = requestAnimationFrame(tick)
    }

    function stopLoop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    function onResize() {
      initGrid()
      draw()
    }

    function onVisibilityChange() {
      if (document.hidden) {
        stopLoop()
      } else {
        startLoop()
      }
    }

    initGrid()
    draw()
    startLoop()

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      stopLoop()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-90 overflow-hidden"
      aria-hidden="true"
    />
  )
}

import { useEffect, useRef } from 'react'
import { intensityProfile, config } from '../../config'

/**
 * Layer A — falling code streams (matrix rain) drawn on a canvas.
 * Mixes binary, hex, glyphs and command fragments at varying speeds.
 */
const GLYPHS =
  '01ABCDEF0123456789<>[]{}#%&$@!?/\\|=+-珠核码密访问节点权限令牌ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜ'

export default function CodeRain({ paused = false }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const density = intensityProfile[config.animationIntensity].rainDensity
    let width = 0
    let height = 0
    let columns = 0
    let fontSize = 16
    let drops: number[] = []
    let speeds: number[] = []
    let dpr = 1

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fontSize = width < 640 ? 13 : 16
      columns = Math.floor((width / fontSize) * density)
      drops = new Array(columns)
      speeds = new Array(columns)
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -height
        speeds[i] = 0.5 + Math.random() * 1.4
      }
    }

    setup()

    let raf = 0
    let last = 0
    const frameGap = reduce ? 120 : 45 // ms — throttle for perf

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (paused) return
      if (t - last < frameGap) return
      last = t

      // translucent black fade → trails
      ctx.fillStyle = 'rgba(2, 6, 4, 0.16)'
      ctx.fillRect(0, 0, width, height)
      ctx.font = `${fontSize}px var(--font-mono, monospace)`
      ctx.textBaseline = 'top'

      const colW = width / columns
      for (let i = 0; i < columns; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        const x = i * colW
        const y = drops[i]

        // leading char brighter
        const lead = Math.random() > 0.965
        if (lead) {
          ctx.fillStyle = 'rgba(150, 205, 182, 0.7)'
          ctx.shadowColor = 'rgba(69,207,146,0.45)'
          ctx.shadowBlur = 4
        } else {
          const shade = 0.28 + Math.random() * 0.5
          ctx.fillStyle = `rgba(69, 207, 146, ${shade})`
          ctx.shadowBlur = 0
        }
        ctx.fillText(ch, x, y)
        ctx.shadowBlur = 0

        if (y > height && Math.random() > 0.975) {
          drops[i] = Math.random() * -120
          speeds[i] = 0.5 + Math.random() * 1.4
        }
        drops[i] += fontSize * speeds[i] * 0.5
      }
    }

    raf = requestAnimationFrame(draw)

    let resizeTimer: number | undefined
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(setup, 180)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeTimer)
    }
  }, [paused])

  return <canvas ref={canvasRef} className="bg-canvas" style={{ opacity: 0.3 }} aria-hidden />
}

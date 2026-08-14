import { useEffect, useRef } from 'react'

/** Lean green matrix rain, drawn faintly behind the UI. */
const GLYPHS = '01ABCDEF0123456789<>[]{}#%$@!?/\\|=+-ｦｱｳｴｵｶｷｸｹｺｻ'

export default function CodeRain() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, cols = 0, font = 15, dpr = 1
    let drops: number[] = []
    let speeds: number[] = []

    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      font = w < 640 ? 13 : 15
      cols = Math.floor(w / font)
      drops = new Array(cols)
      speeds = new Array(cols)
      for (let i = 0; i < cols; i++) {
        drops[i] = Math.random() * -h
        speeds[i] = 0.5 + Math.random() * 1.2
      }
    }
    setup()

    let raf = 0, last = 0
    const gap = reduce ? 140 : 55

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (t - last < gap) return
      last = t
      ctx.fillStyle = 'rgba(4, 8, 6, 0.18)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = `${font}px ${'ui-monospace, monospace'}`
      ctx.textBaseline = 'top'
      const cw = w / cols
      for (let i = 0; i < cols; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        const x = i * cw
        const y = drops[i]
        if (Math.random() > 0.975) {
          ctx.fillStyle = 'rgba(190, 255, 228, 0.9)'
        } else {
          ctx.fillStyle = `rgba(0, 255, 163, ${0.25 + Math.random() * 0.4})`
        }
        ctx.fillText(ch, x, y)
        if (y > h && Math.random() > 0.975) {
          drops[i] = Math.random() * -100
          speeds[i] = 0.5 + Math.random() * 1.2
        }
        drops[i] += font * speeds[i] * 0.5
      }
    }
    raf = requestAnimationFrame(draw)

    let rt: number | undefined
    const onResize = () => { window.clearTimeout(rt); rt = window.setTimeout(setup, 180) }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(rt)
    }
  }, [])

  return <canvas ref={ref} className="matrix" aria-hidden />
}

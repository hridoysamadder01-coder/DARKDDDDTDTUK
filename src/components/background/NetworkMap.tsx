import { useEffect, useRef } from 'react'
import { intensityProfile, config } from '../../config'

/**
 * Layer B — faint moving network map: drifting nodes, connecting lines,
 * pulsing points and fictional labels.
 */
const LABELS = [
  'NODE-7X',
  'BLACKNODE-21',
  'OMEGA-4',
  'EU-GATE-9',
  'VAULT-11',
  'GHOST-3',
  'SINK-0',
  'RELAY-88',
]

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  label?: string
  pulse: number
  pulseSpeed: number
}

export default function NetworkMap({ paused = false }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const count = Math.max(
      6,
      Math.round(
        intensityProfile[config.animationIntensity].nodes *
          (window.innerWidth < 640 ? 0.55 : 1),
      ),
    )

    let width = 0
    let height = 0
    let dpr = 1
    let nodes: Node[] = []

    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      nodes = []
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          label: i % 3 === 0 ? LABELS[i % LABELS.length] : undefined,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.03,
        })
      }
    }

    setup()

    const maxDist = width < 640 ? 150 : 220
    let raf = 0
    let last = 0
    const gap = reduce ? 120 : 33

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (paused) return
      if (t - last < gap) return
      last = t

      ctx.clearRect(0, 0, width, height)

      // move
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
        n.pulse += n.pulseSpeed
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.22
            ctx.strokeStyle = `rgba(69, 207, 146, ${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // nodes
      ctx.font = '10px var(--font-mono, monospace)'
      for (const n of nodes) {
        const r = 1.6 + (Math.sin(n.pulse) + 1) * 1.6
        const glow = 0.35 + (Math.sin(n.pulse) + 1) * 0.28
        ctx.beginPath()
        ctx.fillStyle = `rgba(69, 207, 146, ${glow})`
        ctx.shadowColor = 'rgba(69,207,146,0.8)'
        ctx.shadowBlur = 8
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        if (n.label) {
          ctx.fillStyle = 'rgba(95, 156, 133, 0.5)'
          ctx.fillText(n.label, n.x + 8, n.y - 6)
        }
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

  return <canvas ref={canvasRef} className="bg-canvas" style={{ opacity: 0.4 }} aria-hidden />
}

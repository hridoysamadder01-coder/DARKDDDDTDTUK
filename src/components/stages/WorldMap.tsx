import { useEffect, useMemo, useRef, useState } from 'react'
import { hex, pick, randInt } from '../../lib/random'

/**
 * Live global intrusion map. A dotted world (procedural land blobs) with
 * labeled city nodes and continuously spawning attack arcs that draw across
 * the map, send a traveling pulse, and flash the target. Purely cosmetic.
 */
const VW = 1000
const VH = 460

// continents approximated as ellipses in normalized [0..1] space
const LAND: Array<[number, number, number, number]> = [
  [0.18, 0.30, 0.09, 0.10], [0.24, 0.23, 0.06, 0.06], [0.27, 0.40, 0.05, 0.08], // N. America
  [0.30, 0.62, 0.05, 0.10], [0.33, 0.76, 0.035, 0.07], // S. America
  [0.49, 0.26, 0.05, 0.05], // Europe
  [0.52, 0.52, 0.07, 0.09], [0.55, 0.63, 0.05, 0.07], // Africa
  [0.66, 0.28, 0.15, 0.11], [0.80, 0.33, 0.06, 0.06], // Asia
  [0.66, 0.44, 0.04, 0.05], // India
  [0.77, 0.52, 0.05, 0.04], // SE Asia
  [0.84, 0.70, 0.06, 0.05], // Australia
]

const CITIES: Array<{ n: string; x: number; y: number }> = [
  { n: 'LA', x: 0.12, y: 0.36 },
  { n: 'NEW YORK', x: 0.26, y: 0.31 },
  { n: 'SÃO PAULO', x: 0.33, y: 0.70 },
  { n: 'LONDON', x: 0.47, y: 0.26 },
  { n: 'BERLIN', x: 0.51, y: 0.26 },
  { n: 'MOSCOW', x: 0.58, y: 0.22 },
  { n: 'LAGOS', x: 0.50, y: 0.55 },
  { n: 'DUBAI', x: 0.61, y: 0.41 },
  { n: 'MUMBAI', x: 0.66, y: 0.46 },
  { n: 'SINGAPORE', x: 0.75, y: 0.55 },
  { n: 'TOKYO', x: 0.87, y: 0.33 },
  { n: 'SYDNEY', x: 0.88, y: 0.74 },
].map((c) => ({ ...c, x: c.x * VW, y: c.y * VH }))

interface Arc { id: number; d: string; tx: number; ty: number }

export default function WorldMap({ cls = '' }: { cls?: string }) {
  // static land dots (deterministic — computed once)
  const dots = useMemo(() => {
    const out: Array<[number, number]> = []
    for (let ny = 0.06; ny < 0.98; ny += 0.028) {
      for (let nx = 0.02; nx < 0.99; nx += 0.016) {
        let inside = false
        for (const [cx, cy, rx, ry] of LAND) {
          const dx = (nx - cx) / rx
          const dy = (ny - cy) / ry
          if (dx * dx + dy * dy <= 1) { inside = true; break }
        }
        if (inside) out.push([nx * VW, ny * VH])
      }
    }
    return out
  }, [])

  const [arcs, setArcs] = useState<Arc[]>([])
  const [blocked, setBlocked] = useState(4127)
  const idRef = useRef(0)

  useEffect(() => {
    let alive = true
    let t = 0
    const spawn = () => {
      if (!alive) return
      const a = pick(CITIES)
      let b = pick(CITIES)
      let guard = 0
      while (b === a && guard++ < 5) b = pick(CITIES)
      const midx = (a.x + b.x) / 2
      const midy = (a.y + b.y) / 2
      const dist = Math.hypot(b.x - a.x, b.y - a.y)
      const cy = midy - dist * 0.34 - 20
      const d = `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${midx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
      const id = idRef.current++
      setArcs((prev) => [...prev.slice(-9), { id, d, tx: b.x, ty: b.y }])
      window.setTimeout(() => {
        if (!alive) return
        setArcs((prev) => prev.filter((x) => x.id !== id))
        setBlocked((n) => n + randInt(1, 4))
      }, 1750)
      t = window.setTimeout(spawn, 480 + Math.random() * 620)
    }
    t = window.setTimeout(spawn, 400)
    return () => { alive = false; window.clearTimeout(t) }
  }, [])

  return (
    <div className={`ops-panel ${cls}`}>
      <div className="ops-h">
        <span className="ops-h-dot" /> GLOBAL INTRUSION MAP
        <span className="ops-h-r">VECTORS {arcs.length} · BLOCKED {blocked.toLocaleString()}</span>
      </div>
      <div className="wm-wrap">
        <svg className="wm-svg" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
          {/* faint lat/long grid */}
          <g className="wm-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={(i + 1) * (VH / 10)} x2={VW} y2={(i + 1) * (VH / 10)} />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={`v${i}`} x1={(i + 1) * (VW / 16)} y1={0} x2={(i + 1) * (VW / 16)} y2={VH} />
            ))}
          </g>

          {/* land dots */}
          <g className="wm-land">
            {dots.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1.5} />
            ))}
          </g>

          {/* attack arcs */}
          {arcs.map((a) => (
            <g key={a.id}>
              <path className="wm-arc" d={a.d} />
              <circle className="wm-pulse" r={3.2}>
                <animateMotion dur="1.05s" repeatCount="1" path={a.d} />
              </circle>
              <circle className="wm-hit" cx={a.tx} cy={a.ty} r={4} />
            </g>
          ))}

          {/* city nodes */}
          <g className="wm-cities">
            {CITIES.map((c) => (
              <g key={c.n}>
                <circle className="wm-city-ring" cx={c.x} cy={c.y} r={7} />
                <circle className="wm-city" cx={c.x} cy={c.y} r={2.4} />
                <text className="wm-label" x={c.x + 9} y={c.y + 3}>{c.n}</text>
              </g>
            ))}
          </g>
        </svg>
        <div className="wm-corner tl">LIVE · 0x{hex(6)}</div>
        <div className="wm-corner br">TARGETS {CITIES.length} · GHOSTNET</div>
      </div>
    </div>
  )
}

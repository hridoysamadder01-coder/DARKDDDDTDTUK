import { useEffect, useMemo, useRef, useState } from 'react'
import { hex, pick, randInt } from '../../lib/random'

/**
 * Live global intrusion map. A dotted world (procedural land blobs) with
 * labeled city nodes and continuously spawning attack arcs that draw across
 * the map, send a traveling pulse, and flash the target. Purely cosmetic.
 */
const VW = 1000
const VH = 460

// continents as normalized [0..1] polygons (x = lon, y = lat, top = north)
const POLYS: number[][][] = [
  // North America
  [[0.02, 0.22], [0.09, 0.14], [0.16, 0.12], [0.21, 0.15], [0.25, 0.12], [0.31, 0.16],
   [0.29, 0.21], [0.31, 0.26], [0.26, 0.30], [0.245, 0.35], [0.205, 0.44], [0.18, 0.46],
   [0.175, 0.40], [0.145, 0.37], [0.115, 0.35], [0.10, 0.30], [0.075, 0.27], [0.045, 0.25]],
  // Greenland
  [[0.30, 0.06], [0.35, 0.05], [0.365, 0.11], [0.335, 0.15], [0.305, 0.11]],
  // South America
  [[0.205, 0.47], [0.25, 0.455], [0.29, 0.49], [0.325, 0.55], [0.34, 0.62], [0.325, 0.66],
   [0.30, 0.71], [0.275, 0.78], [0.255, 0.82], [0.24, 0.79], [0.245, 0.70], [0.23, 0.62],
   [0.215, 0.55]],
  // Africa
  [[0.43, 0.33], [0.49, 0.32], [0.55, 0.34], [0.585, 0.40], [0.57, 0.47], [0.55, 0.52],
   [0.525, 0.60], [0.495, 0.65], [0.465, 0.62], [0.45, 0.54], [0.43, 0.47], [0.415, 0.40]],
  // Europe + Asia + Russia
  [[0.42, 0.30], [0.45, 0.24], [0.49, 0.225], [0.545, 0.195], [0.61, 0.175], [0.70, 0.165],
   [0.80, 0.175], [0.885, 0.215], [0.93, 0.25], [0.905, 0.295], [0.86, 0.325], [0.80, 0.335],
   [0.74, 0.35], [0.705, 0.395], [0.675, 0.40], [0.635, 0.42], [0.60, 0.42], [0.565, 0.395],
   [0.545, 0.335], [0.50, 0.305], [0.455, 0.305]],
  // India
  [[0.615, 0.40], [0.665, 0.40], [0.69, 0.44], [0.665, 0.50], [0.64, 0.47], [0.625, 0.44]],
  // SE Asia / Indonesia
  [[0.70, 0.47], [0.76, 0.485], [0.805, 0.515], [0.83, 0.555], [0.80, 0.575], [0.755, 0.555],
   [0.715, 0.52]],
  // Australia
  [[0.795, 0.66], [0.86, 0.645], [0.915, 0.685], [0.905, 0.75], [0.855, 0.775], [0.805, 0.745],
   [0.785, 0.70]],
]
// small islands / peninsulas as ellipses [cx, cy, rx, ry]
const ISLES: Array<[number, number, number, number]> = [
  [0.452, 0.245, 0.016, 0.024], // British Isles
  [0.888, 0.335, 0.016, 0.05], // Japan
  [0.93, 0.80, 0.014, 0.03], // New Zealand
  [0.60, 0.47, 0.02, 0.02], // Arabian tip
]

function inPoly(x: number, y: number, poly: number[][]): boolean {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

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
    for (let ny = 0.04; ny < 0.98; ny += 0.024) {
      for (let nx = 0.01; nx < 0.99; nx += 0.0135) {
        let inside = false
        for (const poly of POLYS) {
          if (inPoly(nx, ny, poly)) { inside = true; break }
        }
        if (!inside) {
          for (const [cx, cy, rx, ry] of ISLES) {
            const dx = (nx - cx) / rx
            const dy = (ny - cy) / ry
            if (dx * dx + dy * dy <= 1) { inside = true; break }
          }
        }
        if (inside) out.push([nx * VW, ny * VH])
      }
    }
    return out
  }, [])

  const [arcs, setArcs] = useState<Arc[]>([])
  const [blocked, setBlocked] = useState(4127)
  const idRef = useRef(0)

  // periodic target-lock cycle
  const [lock, setLock] = useState<{ n: string; x: number; y: number; id: number } | null>(null)
  const lockId = useRef(0)
  useEffect(() => {
    let alive = true
    let t = 0
    let clr = 0
    const cycle = () => {
      t = window.setTimeout(() => {
        if (!alive) return
        const c = pick(CITIES)
        setLock({ n: c.n, x: c.x, y: c.y, id: lockId.current++ })
        clr = window.setTimeout(() => { if (alive) setLock(null) }, 2200)
        cycle()
      }, 3200 + Math.random() * 3000)
    }
    cycle()
    return () => { alive = false; window.clearTimeout(t); window.clearTimeout(clr) }
  }, [])

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

          {/* target lock reticle */}
          {lock && (
            <g className="wm-lock" key={lock.id}>
              <circle className="wm-lock-ping" cx={lock.x} cy={lock.y} r={10} />
              <rect className="wm-lock-box" x={lock.x - 16} y={lock.y - 16} width={32} height={32} />
              <line className="wm-lock-x" x1={lock.x - 26} y1={lock.y} x2={lock.x - 9} y2={lock.y} />
              <line className="wm-lock-x" x1={lock.x + 9} y1={lock.y} x2={lock.x + 26} y2={lock.y} />
              <line className="wm-lock-x" x1={lock.x} y1={lock.y - 26} x2={lock.x} y2={lock.y - 9} />
              <line className="wm-lock-x" x1={lock.x} y1={lock.y + 9} x2={lock.x} y2={lock.y + 26} />
              <text className="wm-lock-lbl" x={lock.x} y={lock.y - 24} textAnchor="middle">
                ◎ TARGET LOCKED · {lock.n}
              </text>
            </g>
          )}

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

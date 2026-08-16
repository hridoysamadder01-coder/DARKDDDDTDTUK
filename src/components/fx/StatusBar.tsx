import { useEffect, useMemo, useRef, useState } from 'react'
import { hex, pick, randInt } from '../../lib/random'

/**
 * Persistent bottom status/data bar shown on the content stages. A live
 * session/packet readout with a continuously scrolling stream of intercept
 * tokens — keeps every screen feeling wired into the same live system.
 */
export default function StatusBar({ active }: { active: boolean }) {
  const [pkt, setPkt] = useState(48213)
  const [clock, setClock] = useState(0)
  const sid = useRef(`X${hex(2)}-${hex(4)}`.toUpperCase())

  useEffect(() => {
    if (!active) return
    const a = window.setInterval(() => setPkt((p) => p + randInt(20, 260)), 800)
    const c = window.setInterval(() => setClock((t) => t + 1), 1000)
    return () => { window.clearInterval(a); window.clearInterval(c) }
  }, [active])

  const stream = useMemo(
    () =>
      Array.from({ length: 20 })
        .map(() =>
          pick([
            'route ok',
            `sig 0x${hex(6)}`,
            `trace hop ${randInt(1, 14)}`,
            `intercept 0x${hex(4)}`,
            'handshake ok',
            `spoof 0x${hex(6)}`,
            `probe ${randInt(4, 90)}ms`,
            'gate cleared',
            `inject 0x${hex(4)}`,
            'decrypt ok',
          ]),
        )
        .join('   ·   '),
    [],
  )

  if (!active) return null
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="statusbar" aria-hidden>
      <div className="sb-l">
        <span className="sb-dot" />SID {sid.current} · NODE CORE-04
      </div>
      <div className="sb-mid">
        <div className="sb-marquee">{stream}   ·   {stream}   ·   </div>
      </div>
      <div className="sb-r">
        PKT {pkt.toLocaleString()} · THREAT GUARDED · {fmt(clock)}
      </div>
    </div>
  )
}

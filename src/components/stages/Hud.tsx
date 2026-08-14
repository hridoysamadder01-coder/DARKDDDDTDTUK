import { useEffect, useState } from 'react'
import { zh, config } from '../../config'

/** Live-updating counter used in the header for atmosphere. */
function useTick(fn: () => void, ms: number) {
  useEffect(() => {
    const id = window.setInterval(fn, ms)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default function Hud() {
  const [packets, setPackets] = useState(48213)
  const [enc, setEnc] = useState(97)
  const [uptime, setUptime] = useState(0)
  const [ping, setPing] = useState(21)

  useTick(() => setPackets((p) => p + Math.floor(Math.random() * 240) + 20), 900)
  useTick(() => setEnc(() => 96 + Math.floor(Math.random() * 4)), 2200)
  useTick(() => setUptime((u) => u + 1), 1000)
  useTick(() => setPing(() => 14 + Math.floor(Math.random() * 22)), 1600)

  const fmt = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0')
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const sec = String(s % 60).padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  return (
    <div className="hud">
      <div className="box panel">
        <div className="stat"><span className="k">SYS</span><span className="v">CORE-TERMINAL-7X</span></div>
        <div className="stat"><span className="k">SESSION</span><span className="v">ACTIVE</span></div>
        <div className="stat"><span className="k">CHANNEL</span><span className="v">ENCRYPTED{config.bilingualLabels ? ` · ${zh.encrypted}` : ''}</span></div>
        <div className="stat"><span className="k">NODE</span><span className="v">7X-PROTOCOL</span></div>
        <div className="stat"><span className="k">PACKETS</span><span className="v amber">{packets.toLocaleString()}</span></div>
      </div>
      <div className="box tr panel">
        <div className="stat"><span className="k">NETWORK</span><span className="v">ONLINE</span></div>
        <div className="stat"><span className="k">SECURITY</span><span className="v amber">RESTRICTED</span></div>
        <div className="stat"><span className="k">ENCRYPTION</span><span className="v">{enc}%</span></div>
        <div className="stat"><span className="k">STATUS</span><span className="v">STABLE</span></div>
        <div className="stat"><span className="k">UPTIME · PING</span><span className="v">{fmt(uptime)} · {ping}ms</span></div>
      </div>
    </div>
  )
}

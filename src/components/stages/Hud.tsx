import { useEffect, useState } from 'react'
import { zh, config } from '../../config'
import { pick, randInt } from '../../lib/random'

function useTick(fn: () => void, ms: number) {
  useEffect(() => {
    const id = window.setInterval(fn, ms)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

const NODES = ['NODE-7X', 'OMEGA-4', 'VAULT-11', 'EU-GATE-9', 'BLACKNODE-21', 'GHOST-3', 'RELAY-88']
const THREAT = ['LOW', 'GUARDED', 'ELEVATED']

export default function Hud() {
  const [packets, setPackets] = useState(48213)
  const [uptime, setUptime] = useState(0)
  const [ping, setPing] = useState(21)
  const [intercepts, setIntercepts] = useState(10432)
  const [links, setLinks] = useState(7)
  const [threat, setThreat] = useState('GUARDED')
  const [trace, setTrace] = useState('OMEGA-4')

  useTick(() => setPackets((p) => p + randInt(20, 260)), 900)
  useTick(() => setUptime((u) => u + 1), 1000)
  useTick(() => setPing(() => randInt(14, 36)), 1600)
  useTick(() => setIntercepts((p) => p + randInt(1, 9)), 700)
  useTick(() => setLinks(() => randInt(5, 12)), 2600)
  useTick(() => setThreat(() => pick(THREAT)), 3400)
  useTick(() => setTrace(() => pick(NODES)), 1700)

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
        <div className="stat"><span className="k">NODE</span><span className="v">CORE-04</span></div>
        <div className="stat"><span className="k">PACKETS</span><span className="v amber">{packets.toLocaleString()}</span></div>
        <div className="stat"><span className="k">INTERCEPTS</span><span className="v amber">{intercepts.toLocaleString()}</span></div>
        <div className="stat"><span className="k">TRACE</span><span className="v">{trace}</span></div>
      </div>
      <div className="box tr panel">
        <div className="stat"><span className="k">NETWORK</span><span className="v">ONLINE</span></div>
        <div className="stat"><span className="k">SECURITY</span><span className="v amber">RESTRICTED</span></div>
        <div className="stat"><span className="k">ENGINE INDEX</span><span className="v">15</span></div>
        <div className="stat"><span className="k">STATUS</span><span className="v">STABLE</span></div>
        <div className="stat"><span className="k">THREAT</span><span className={`v ${threat === 'ELEVATED' ? 'red' : threat === 'LOW' ? '' : 'amber'}`}>{threat}</span></div>
        <div className="stat"><span className="k">ACTIVE LINKS</span><span className="v">{links}</span></div>
        <div className="stat"><span className="k">UPTIME · PING</span><span className="v">{fmt(uptime)} · {ping}ms</span></div>
      </div>
    </div>
  )
}

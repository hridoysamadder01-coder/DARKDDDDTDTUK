import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from '../../hooks/useSoundToggle'
import { makeBuildFile } from '../../lib/codegen'
import { ambientLine } from '../../lib/feed'
import { hex, pick, randInt } from '../../lib/random'
import GlitchText from '../ui/GlitchText'
import WorldMap from './WorldMap'

/* ───────── one streaming code column (multi coding animation) ───────── */
function CodePanel({ label, seed, cls = '' }: { label: string; seed: number; cls?: string }) {
  const [rows, setRows] = useState<string[]>([])
  const [typing, setTyping] = useState('')
  const [name, setName] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let fileIdx = seed
    let file = makeBuildFile(fileIdx)
    let li = 0
    let cp = 0
    setName(file.name)
    const iv = window.setInterval(() => {
      const line = file.lines[li] ?? ''
      if (cp < line.length) {
        cp += 2 + Math.floor(Math.random() * 3)
        setTyping(line.slice(0, cp))
      } else {
        setRows((prev) => [...prev.slice(-60), line])
        setTyping('')
        li += 1
        cp = 0
        if (li >= file.lines.length) {
          fileIdx += 1
          file = makeBuildFile(fileIdx)
          li = 0
          setName(file.name)
        }
      }
    }, 26)
    return () => window.clearInterval(iv)
  }, [seed])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [rows, typing])

  return (
    <div className={`ops-panel ${cls}`}>
      <div className="ops-h">
        <span className="ops-h-dot" /> {label}
        <span className="ops-h-r">{name.split('/').pop()}</span>
      </div>
      <div className="ops-code" ref={bodyRef}>
        {rows.map((r, i) => (
          <div key={i} className="ops-cl">{r || ' '}</div>
        ))}
        <div className="ops-cl active">
          {typing}
          <span className="ops-caret" />
        </div>
      </div>
    </div>
  )
}

/* ───────── rotating radar + live trace hops ───────── */
const NODES = ['NODE-7X', 'OMEGA-4', 'VAULT-11', 'EU-GATE-9', 'BLACKNODE-21', 'GHOST-3', 'RELAY-88', 'SINK-0', 'ZERO-LINK']
function RadarPanel({ cls = '' }: { cls?: string }) {
  const [hops, setHops] = useState<string[]>([])
  useEffect(() => {
    let k = 1
    const iv = window.setInterval(() => {
      setHops((prev) => [...prev.slice(-5), `hop ${String(k++).padStart(2, '0')} · ${pick(NODES)} · ${randInt(4, 90)}ms`])
    }, 520)
    return () => window.clearInterval(iv)
  }, [])
  const blips = [
    { top: '22%', left: '30%' }, { top: '40%', left: '68%' }, { top: '64%', left: '44%' },
    { top: '30%', left: '54%' }, { top: '72%', left: '24%' }, { top: '54%', left: '78%' },
  ]
  return (
    <div className={`ops-panel ${cls}`}>
      <div className="ops-h"><span className="ops-h-dot" /> NETWORK TRACE<span className="ops-h-r">LIVE</span></div>
      <div className="ops-radar-wrap">
        <div className="ops-radar">
          <span className="ops-ring r1" />
          <span className="ops-ring r2" />
          <span className="ops-ring r3" />
          <span className="ops-sweep" />
          {blips.map((b, i) => (
            <span key={i} className="ops-blip" style={{ top: b.top, left: b.left, animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>
        <div className="ops-hops">
          {hops.map((h, i) => (
            <div key={i} className="ops-hop">{h}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───────── fast intercept packet log ───────── */
function PacketPanel({ cls = '' }: { cls?: string }) {
  const [lines, setLines] = useState<Array<{ id: number; t: string; k: string }>>([])
  useEffect(() => {
    let id = 0
    const iv = window.setInterval(() => {
      const [t, k] = ambientLine()
      setLines((prev) => [...prev.slice(-13), { id: id++, t, k }])
    }, 240)
    return () => window.clearInterval(iv)
  }, [])
  return (
    <div className={`ops-panel ${cls}`}>
      <div className="ops-h"><span className="ops-h-dot" /> PACKET INTERCEPT<span className="ops-h-r">NODE-04</span></div>
      <div className="ops-log">
        {lines.map((l) => (
          <div key={l.id} className={`ops-ll ${l.k}`}>› {l.t}</div>
        ))}
      </div>
    </div>
  )
}

/* ───────── live memory hex dump ───────── */
function HexPanel({ cls = '' }: { cls?: string }) {
  const [block, setBlock] = useState<string[]>([])
  useEffect(() => {
    const gen = () =>
      Array.from({ length: 9 }).map(
        () => `0x${hex(6)}  ` + Array.from({ length: 8 }).map(() => hex(2)).join(' '),
      )
    setBlock(gen())
    const iv = window.setInterval(() => setBlock(gen()), 130)
    return () => window.clearInterval(iv)
  }, [])
  return (
    <div className={`ops-panel ${cls}`}>
      <div className="ops-h"><span className="ops-h-dot" /> MEMORY DUMP<span className="ops-h-r">0x{hex(4)}</span></div>
      <div className="ops-hex">
        {block.map((r, i) => (
          <div key={i} className="ops-hex-row">{r}</div>
        ))}
      </div>
    </div>
  )
}

/* ───────── live system meters ───────── */
const METERS = ['CPU', 'MEM', 'NET', 'GPU', 'I/O', 'CRYPT']
function MetersPanel({ cls = '' }: { cls?: string }) {
  const [vals, setVals] = useState<number[]>(() => METERS.map(() => randInt(30, 90)))
  useEffect(() => {
    const iv = window.setInterval(() => setVals(METERS.map(() => randInt(24, 99))), 420)
    return () => window.clearInterval(iv)
  }, [])
  return (
    <div className={`ops-panel ${cls}`}>
      <div className="ops-h"><span className="ops-h-dot" /> CORE LOAD<span className="ops-h-r">REAL-TIME</span></div>
      <div className="ops-meters">
        {METERS.map((m, i) => (
          <div className="ops-meter" key={m}>
            <span className="ops-meter-k">{m}</span>
            <span className="ops-meter-bar"><span style={{ width: `${vals[i]}%` }} className={vals[i] > 88 ? 'hot' : ''} /></span>
            <span className="ops-meter-v">{vals[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────── fictional target dossier ───────── */
function DossierPanel({ cls = '' }: { cls?: string }) {
  const [key, setKey] = useState(() => hex(16))
  useEffect(() => {
    const iv = window.setInterval(() => setKey(hex(16)), 700)
    return () => window.clearInterval(iv)
  }, [])
  const rows: Array<[string, string, string]> = [
    ['CODENAME', 'OBSIDIAN CORE X', 'g'],
    ['ORIGIN', 'SECTOR-7 · CLASSIFIED', ''],
    ['CLEARANCE', 'OMEGA', 'a'],
    ['ENCRYPTION', 'LAYER 9 · SEALED', ''],
    ['STATUS', 'BREACH IN PROGRESS', 'r'],
  ]
  return (
    <div className={`ops-panel ${cls}`}>
      <div className="ops-h"><span className="ops-h-dot" /> TARGET DOSSIER<span className="ops-h-r">EYES ONLY</span></div>
      <div className="ops-dossier">
        {rows.map(([k, v, tone]) => (
          <div className="ops-dr" key={k}>
            <span className="ops-dr-k">{k}</span>
            <span className={`ops-dr-v ${tone === 'g' ? 'g' : tone === 'a' ? 'a' : tone === 'r' ? 'r' : ''}`}>{v}</span>
          </div>
        ))}
        <div className="ops-dr-key">MASTER KEY · 0x{key}</div>
      </div>
    </div>
  )
}

/* ───────── master breach sequence ───────── */
const STAGES = [
  'MAPPING NETWORK TOPOLOGY',
  'SPOOFING ROUTE · MASKING ORIGIN',
  'INJECTING ACCESS PAYLOAD',
  'BYPASSING SENTINEL LAYER',
  'DECRYPTING CORE SIGNATURE',
  'CORE BREACHED',
]

export default function OpsBoot({ onDone }: { onDone: () => void }) {
  const { play } = useSound()
  const [pct, setPct] = useState(0)
  const [stage, setStage] = useState(0)
  const [breached, setBreached] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [thru, setThru] = useState(180)
  const sid = useRef(`X${hex(2)}-${hex(4)}`.toUpperCase())
  const done = useRef(false)

  useEffect(() => {
    const clock = window.setInterval(() => setElapsed((e) => e + 1), 1000)
    const tw = window.setInterval(() => setThru(120 + Math.floor(Math.random() * 220)), 500)
    return () => { window.clearInterval(clock); window.clearInterval(tw) }
  }, [])

  useEffect(() => {
    const iv = window.setInterval(() => {
      setPct((p) => {
        if (p >= 100) return 100
        const np = Math.min(100, p + 0.7 + Math.random() * 1.5)
        const s = Math.min(STAGES.length - 1, Math.floor((np / 100) * STAGES.length))
        setStage((cur) => {
          if (s !== cur) play(s >= STAGES.length - 1 ? 'confirm' : 'beep')
          return s
        })
        if (np >= 100 && !done.current) {
          done.current = true
          play('glitch')
          setBreached(true)
          window.setTimeout(() => onDone(), 1500)
        }
        return np
      })
    }, 95)
    return () => window.clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <motion.div className="ops" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="ops-top">
        <div className="ops-top-l">
          <span className="ops-top-dot" />
          <b>CORE OPERATIONS</b>
          <span className="ops-top-sub">// LIVE BREACH SESSION</span>
        </div>
        <div className="ops-top-r">
          <span>SID <b>{sid.current}</b></span>
          <span>THRU <b>{thru} MB/s</b></span>
          <span>{mm}:{ss}</span>
        </div>
      </div>

      <div className="ops-grid">
        <CodePanel label="COMPILE-A" seed={1} cls="ga-codeA" />
        <WorldMap cls="ga-map" />
        <RadarPanel cls="ga-radar" />
        <CodePanel label="COMPILE-B" seed={3} cls="ga-codeB hide-sm" />
        <MetersPanel cls="ga-meters" />
        <HexPanel cls="ga-hex hide-sm" />
        <PacketPanel cls="ga-packets" />
        <DossierPanel cls="ga-dossier" />
      </div>

      <div className="ops-foot">
        <div className="ops-foot-status">
          <span className="ops-foot-ic">▸</span>
          {STAGES[stage]}
          <span className="ops-foot-hex"> :: 0x{hex(6)}</span>
        </div>
        <div className="ops-foot-bar"><span style={{ width: `${pct}%` }} /></div>
        <div className="ops-foot-pct">{Math.floor(pct)}%</div>
      </div>

      <AnimatePresence>
        {breached && (
          <motion.div
            className="ops-breach"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="ops-breach-flash" />
            <GlitchText text="CORE BREACHED" always />
            <div className="ops-breach-sub">ACCESS OVERRIDE ACCEPTED</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

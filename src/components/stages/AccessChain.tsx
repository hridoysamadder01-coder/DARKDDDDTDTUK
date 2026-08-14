import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Engine } from '../../types'
import { useSequence, type SequenceStep } from '../../hooks/useSequence'
import { useSound } from '../../hooks/useSoundToggle'
import GlitchText from '../ui/GlitchText'

interface Step {
  text: string
  pct: number
  flash?: boolean
}
const STEPS: Step[] = [
  { text: 'ANALYZING BUILD SIGNATURE', pct: 12 },
  { text: 'CHECKING DEVICE CLASS', pct: 21 },
  { text: 'MOBILE ARCHITECTURE DETECTED', pct: 34 },
  { text: 'ANDROID / IPHONE COMPATIBILITY CONFIRMED', pct: 46 },
  { text: 'REQUESTING ACCESS NODE', pct: 58 },
  { text: 'NEGOTIATING ENCRYPTED CHANNEL', pct: 69 },
  { text: 'VERIFYING CORE PACKAGE', pct: 78 },
  { text: 'UNIFIED VISION STACK DETECTED', pct: 86 },
  { text: 'PRIVATE LICENSE GATE FOUND', pct: 93, flash: true },
  { text: 'AUTHORIZATION TOKEN REQUIRED', pct: 97, flash: true },
]

const FRAGMENTS = [
  'exec /sys/core/loader --sealed',
  'mount vault-11 :: ro',
  'handshake node-7x :: 0x%%',
  'route eu-gate-9 -> omega-4',
  'sig verify 0x%%%%%%',
  'alloc 0x%%%% :: heap',
  'stream blacknode-21 open',
  'decrypt layer::%% ok',
  'ping vault-net :: %%ms',
  'sync ghostchain :: %%%',
  'trace pkt 0x%%%% -> sink',
  'attest sim-token 0x%%%%',
  'negotiate tls-sim :: ok',
]
const HEX = '0123456789abcdef'
const render = (f: string) => f.replace(/%/g, () => HEX[Math.floor(Math.random() * 16)])

interface LogLine { id: number; text: string; kind?: string }

export default function AccessChain({ engine, onDone }: { engine: Engine; onDone: () => void }) {
  const { play } = useSound()
  const [headline, setHeadline] = useState(STEPS[0].text)
  const [targetPct, setTargetPct] = useState(0)
  const [pct, setPct] = useState(0)
  const [logs, setLogs] = useState<LogLine[]>([])
  const [flash, setFlash] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const logId = useRef(0)
  const label = engine.name.split('//')[0].trim()

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setPct((p) => {
        const d = targetPct - p
        if (Math.abs(d) < 0.4) return targetPct
        return p + d * 0.12 + (Math.random() - 0.4) * 0.5
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [targetPct])

  useEffect(() => {
    if (unlocked) return
    const id = window.setInterval(() => {
      setLogs((prev) => {
        const kind = Math.random() > 0.92 ? 'warn' : undefined
        return [...prev, { id: logId.current++, text: render(FRAGMENTS[Math.floor(Math.random() * FRAGMENTS.length)]), kind }].slice(-26)
      })
    }, 130)
    return () => window.clearInterval(id)
  }, [unlocked])

  const steps: SequenceStep[] = useMemo(() => {
    const s: SequenceStep[] = []
    STEPS.forEach((st, i) => {
      s.push({
        at: i === 0 ? 300 : 560 + Math.round(Math.random() * 240),
        run: () => {
          setHeadline(st.text)
          setTargetPct(st.pct)
          play('beep')
          setLogs((prev) => [...prev, { id: logId.current++, text: `» ${st.text}`, kind: 'ok' }])
          if (st.flash) {
            setFlash(true)
            play('warn')
            window.setTimeout(() => setFlash(false), 280)
          }
        },
      })
    })
    s.push({
      at: 760,
      run: () => {
        setTargetPct(100)
        setHeadline('ACCESS LAYER UNLOCKED')
        setUnlocked(true)
        play('confirm')
      },
    })
    s.push({ at: 1400, run: () => onDone() })
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { skip } = useSequence(steps)
  const logRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  return (
    <div className="access" onClick={skip} title="click to skip">
      <div className="inner">
        <div className="card chain-card">
          <AnimatePresence mode="wait">
            {!unlocked ? (
              <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="eyebrow">SECURE ACCESS PROTOCOL · {label}</div>
                <div className="chain-pct">{Math.round(pct)}%</div>
                <div className="bar" style={{ height: 8 }}>
                  <div className={`fill`} style={{ width: `${pct}%`, background: flash ? undefined : undefined }} />
                </div>
                <motion.div className="chain-headline" key={headline} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  {headline}
                  <span className="caret" />
                </motion.div>
                <div className="chain-log" ref={logRef}>
                  {logs.map((l) => (
                    <div key={l.id} className={`l ${l.kind ?? ''}`}>{l.text}</div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="unlocked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              >
                <div className="chain-pct">100%</div>
                <GlitchText as="div" className="chain-unlocked" text="ACCESS LAYER UNLOCKED" always />
                <div className="prov-sub mt16">Proceeding to secure checkout…</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {flash && <div className="red-flash" />}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSequence, type SequenceStep } from '../../hooks/useSequence'
import { useSound } from '../../hooks/useSoundToggle'
import { logFragments, renderFragment, pick } from '../../lib/random'
import type { LogLine } from '../ui/TerminalLog'
import TerminalLog from '../ui/TerminalLog'
import ProgressBar from '../ui/ProgressBar'
import GlitchText from '../ui/GlitchText'

interface Step {
  text: string
  pct: number
  flash?: boolean
  black?: boolean
}

const STEPS: Step[] = [
  { text: 'ANALYZING BUILD SIGNATURE', pct: 12 },
  { text: 'CHECKING DEVICE CLASS', pct: 20 },
  { text: 'MOBILE ARCHITECTURE DETECTED', pct: 28 },
  { text: 'ANDROID / IPHONE COMPATIBILITY CONFIRMED', pct: 41 },
  { text: 'REQUESTING ACCESS NODE', pct: 55, black: true },
  { text: 'NEGOTIATING ENCRYPTED CHANNEL', pct: 67 },
  { text: 'VERIFYING CORE PACKAGE', pct: 76 },
  { text: 'UNIFIED VISION STACK DETECTED', pct: 83 },
  { text: 'PRIVATE LICENSE GATE FOUND', pct: 92, flash: true },
  { text: 'AUTHORIZATION TOKEN REQUIRED', pct: 96, flash: true },
]

export default function AccessChain({ onDone }: { onDone: () => void }) {
  const { play } = useSound()
  const [headline, setHeadline] = useState(STEPS[0].text)
  const [targetPct, setTargetPct] = useState(0)
  const [pct, setPct] = useState(0)
  const [logs, setLogs] = useState<LogLine[]>([])
  const [flash, setFlash] = useState(false)
  const [black, setBlack] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const logId = useRef(0)

  // Smoothly chase the target percentage.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      setPct((p) => {
        const diff = targetPct - p
        if (Math.abs(diff) < 0.4) return targetPct
        return p + diff * 0.12 + (Math.random() - 0.4) * 0.6
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [targetPct])

  // Flood the log with fake system fragments.
  useEffect(() => {
    if (unlocked) return
    const id = window.setInterval(() => {
      setLogs((prev) => {
        const kind = Math.random() > 0.9 ? 'warn' : Math.random() > 0.96 ? 'err' : 'dim'
        const next: LogLine = {
          id: logId.current++,
          text: renderFragment(pick(logFragments)),
          kind: kind as LogLine['kind'],
        }
        const arr = [...prev, next]
        return arr.slice(-40)
      })
    }, 120)
    return () => window.clearInterval(id)
  }, [unlocked])

  const steps: SequenceStep[] = useMemo(() => {
    const s: SequenceStep[] = []
    STEPS.forEach((st, i) => {
      s.push({
        at: i === 0 ? 300 : 620 + Math.round(Math.random() * 260),
        run: () => {
          setHeadline(st.text)
          setTargetPct(st.pct)
          play('beep')
          setLogs((prev) => [
            ...prev,
            { id: logId.current++, text: `» ${st.text}`, kind: 'ok' },
          ])
          if (st.black) {
            setBlack(true)
            play('glitch')
            window.setTimeout(() => setBlack(false), 260)
          }
          if (st.flash) {
            setFlash(true)
            play('warn')
            window.setTimeout(() => setFlash(false), 300)
          }
        },
      })
    })
    // finalize → 100%
    s.push({
      at: 760,
      run: () => {
        setTargetPct(100)
        setHeadline('ACCESS LAYER UNLOCKED')
        setUnlocked(true)
        play('confirm')
      },
    })
    s.push({ at: 1500, run: () => onDone() })
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { skip } = useSequence(steps)

  return (
    <div className="cine chain" onClick={skip} title="click to skip">
      <div className="inner">
        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="chain-status faded" style={{ fontSize: 11, letterSpacing: '0.24em', color: 'var(--text-dim)' }}>
                OBSIDIAN CORE X // ACCESS CHAIN
              </div>
              <div className="pct">{Math.round(pct)}%</div>
              <div style={{ maxWidth: 460, margin: '0 auto 10px' }}>
                <ProgressBar value={pct} danger={flash} />
              </div>
              <motion.div
                className="headline"
                key={headline}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {headline}
                <span className="cursor" />
              </motion.div>
              <div className="log-wrap panel framed">
                <TerminalLog lines={logs} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              <div className="pct">100%</div>
              <GlitchText as="div" className="unlocked" text="ACCESS LAYER UNLOCKED" always />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {flash && <div className="red-flash" />}
      {black && <div className="black-cut" />}
    </div>
  )
}

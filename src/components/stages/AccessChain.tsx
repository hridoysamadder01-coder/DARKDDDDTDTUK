import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import type { Engine } from '../../types'
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

// Exact spec sequence.
const STEPS: Step[] = [
  { text: 'ANALYZING BUILD SIGNATURE', pct: 12 },
  { text: 'CHECKING DEVICE CLASS', pct: 28 },
  { text: 'MOBILE ARCHITECTURE DETECTED', pct: 41 },
  { text: 'VALIDATING UNIVERSAL RUNTIME', pct: 57 },
  { text: 'ANDROID / IPHONE COMPATIBILITY CONFIRMED', pct: 67 },
  { text: 'REQUESTING PRIVATE NODE', pct: 75, black: true },
  { text: 'NEGOTIATING SECURE CHANNEL', pct: 83 },
  { text: 'VERIFYING CORE PACKAGE', pct: 92 },
  { text: 'CROSS-MODEL STACK DETECTED', pct: 96, flash: true },
  { text: 'ACCESS GATE LOCATED', pct: 100 },
]

export default function AccessChain({ engine, onDone }: { engine: Engine; onDone: () => void }) {
  const { play } = useSound()
  const chainLabel = useMemo(
    () => engine.name.split('//').slice(0, 2).join('//').trim(),
    [engine.name],
  )
  const [headline, setHeadline] = useState(STEPS[0].text)
  const [pct, setPct] = useState(0)
  const [logs, setLogs] = useState<LogLine[]>([])
  const [flash, setFlash] = useState(false)
  const [black, setBlack] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const logId = useRef(0)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const doneRef = useRef(false)

  const addLog = (text: string, kind?: LogLine['kind']) =>
    setLogs((prev) => [...prev, { id: logId.current++, text, kind }].slice(-40))

  // Ambient log flood — bursts of technical fragments.
  useEffect(() => {
    if (unlocked) return
    const iv = window.setInterval(() => {
      setLogs((prev) => {
        const kind: LogLine['kind'] = Math.random() > 0.9 ? 'warn' : undefined
        return [
          ...prev,
          { id: logId.current++, text: renderFragment(pick(logFragments)), kind },
        ].slice(-40)
      })
    }, 130)
    return () => window.clearInterval(iv)
  }, [unlocked])

  // One controlled GSAP master timeline drives the whole sequence.
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const st = { v: 0 }

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      setUnlocked(true)
      setPct(100)
      setHeadline('ACCESS LAYER UNLOCKED')
      play('confirm')
      // wait for the user to tap PROCEED — no auto-advance
    }

    const tl = gsap.timeline({ onComplete: finish, delay: 0.3 })
    if (reduce) tl.timeScale(2.2)

    STEPS.forEach((step, i) => {
      tl.to(
        st,
        {
          v: step.pct,
          duration: 0.55 + Math.random() * 0.3,
          ease: 'power1.inOut',
          onStart: () => {
            setHeadline(step.text)
            addLog(`» ${step.text}`, 'ok')
            play('beep')
            if (step.black) {
              setBlack(true)
              play('glitch')
              gsap.delayedCall(0.26, () => setBlack(false))
            }
            if (step.flash) {
              setFlash(true)
              play('warn')
              gsap.delayedCall(0.3, () => setFlash(false))
            }
          },
          onUpdate: () => setPct(Math.round(st.v)),
        },
        i === 0 ? 0 : '+=0.14',
      )
    })

    tlRef.current = tl
    return () => {
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clicking during the run fast-forwards to the unlocked gate (still a manual
  // step — the user must then tap PROCEED to continue).
  const skip = () => {
    if (unlocked) return
    tlRef.current?.kill()
    if (doneRef.current) return
    doneRef.current = true
    setUnlocked(true)
    setPct(100)
    setHeadline('ACCESS LAYER UNLOCKED')
    play('confirm')
  }

  const logRef = useRef<HTMLDivElement>(null)

  return (
    <div className="cine chain" onClick={skip} title="click to skip">
      <div className="inner">
        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                className="chain-status faded"
                style={{ fontSize: 11, letterSpacing: '0.24em', color: 'var(--text-dim)' }}
              >
                {chainLabel} // ACCESS CHAIN
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
              <div className="log-wrap panel framed" ref={logRef}>
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
              <motion.div
                style={{ marginTop: 26 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <button
                  className="btn primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    play('whoosh')
                    onDone()
                  }}
                >
                  PROCEED ▸
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {flash && <div className="red-flash" />}
      {black && <div className="black-cut" />}
    </div>
  )
}

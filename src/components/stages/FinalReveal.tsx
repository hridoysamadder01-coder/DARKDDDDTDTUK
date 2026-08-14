import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Engine } from '../../types'
import { useSequence, type SequenceStep } from '../../hooks/useSequence'
import { useSound } from '../../hooks/useSoundToggle'
import { config } from '../../config'
import ProgressBar from '../ui/ProgressBar'
import GlitchText from '../ui/GlitchText'
import TerminalLog, { type LogLine } from '../ui/TerminalLog'

type Phase = 'granted' | 'decrypt' | 'blackout' | 'prank'

const FINAL_LINES = [
  'DECRYPTING PACKAGE',
  'VERIFYING MODULES',
  'FINALIZING ENGINE',
  'INITIALIZATION COMPLETE',
]

export default function FinalReveal({
  engine,
  onRestart,
}: {
  engine: Engine
  onRestart: () => void
}) {
  const { play } = useSound()
  const parts = useMemo(() => engine.name.split('//').map((s) => s.trim()), [engine.name])
  const codename = parts[0] || config.targetCodename
  const subtitle = parts[1] || 'UNIVERSAL NATIVE BUILD'
  const [phase, setPhase] = useState<Phase>('granted')
  const [pct, setPct] = useState(0)
  const [logs, setLogs] = useState<LogLine[]>([])
  const id = useRef(0)

  const steps: SequenceStep[] = useMemo(() => {
    const s: SequenceStep[] = []
    s.push({ at: 200, run: () => play('confirm') })
    s.push({ at: 1500, run: () => { setPhase('decrypt'); play('whoosh') } })
    FINAL_LINES.forEach((line, i) => {
      s.push({
        at: 700 + i * 60,
        run: () => {
          setLogs((prev) => [...prev, { id: id.current++, text: line, kind: 'ok' }])
          setPct(Math.round(((i + 1) / FINAL_LINES.length) * 100))
          play('beep')
        },
      })
    })
    s.push({ at: 900, run: () => { setPhase('blackout'); play('glitch') } })
    s.push({ at: 1400, run: () => { setPhase('prank'); play('confirm') } })
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSequence(steps)

  // extra confetti-free glitch pulse when the punchline lands
  useEffect(() => {
    if (phase === 'prank') play('glitch')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <div className="cine final">
      <AnimatePresence mode="wait">
        {(phase === 'granted' || phase === 'decrypt') && (
          <motion.div
            key="grant"
            className="inner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlitchText as="div" className="granted" text="ACCESS GRANTED" always intensity={0.2} />
            <div className="prod">
              {codename}
              <small>{subtitle}</small>
            </div>
            <div className="status">PACKAGE STATUS: READY · {config.accessLabel}</div>

            {phase === 'decrypt' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt24">
                <div style={{ maxWidth: 420, margin: '0 auto 8px' }}>
                  <ProgressBar value={pct} />
                </div>
                <div className="faded" style={{ fontSize: 13, letterSpacing: '0.1em' }}>{pct}%</div>
                <div className="panel framed mt16" style={{ padding: 12, textAlign: 'left', maxWidth: 420, margin: '16px auto 0' }}>
                  <TerminalLog lines={logs} />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'blackout' && (
          <motion.div
            key="black"
            style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 90 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {phase === 'prank' && (
          <motion.div
            key="prank"
            className="reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 16 }}
          >
            <GlitchText as="div" className="big" text={config.finalPrankMessage} always intensity={0.3} />
            <div className="mid">{config.finalPrankSubtitle}</div>
            <div className="note">
              {config.finalPrankNote}
              <br />
              <br />
              You explored a fictional “underground engine marketplace”. Every price,
              wallet, network, and verification you saw was pure front-end theatre —
              nothing was ever sent, stored, or charged.
            </div>
            <div className="actions">
              <button className="btn primary" onClick={onRestart}>
                ⟲ RUN IT AGAIN
              </button>
              <button
                className="btn ghost"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {})
                }}
              >
                ⧉ COPY LINK TO PRANK A FRIEND
              </button>
            </div>
            <div className="mt24 faded" style={{ fontSize: 11, letterSpacing: '0.22em' }}>
              {config.simulationLabel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

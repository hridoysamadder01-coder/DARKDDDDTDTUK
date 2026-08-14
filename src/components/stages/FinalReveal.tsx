import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Engine } from '../../types'
import { useSequence, type SequenceStep } from '../../hooks/useSequence'
import { useSound } from '../../hooks/useSoundToggle'
import { config } from '../../config'
import ProgressBar from '../ui/ProgressBar'
import GlitchText from '../ui/GlitchText'
import TerminalLog, { type LogLine } from '../ui/TerminalLog'

type Phase = 'granted' | 'decrypt' | 'ready'

const FINAL_LINES = [
  'DECRYPTING CORE',
  'VERIFYING MODULES',
  'LINKING VISION STACK',
  'COMPILING NATIVE RUNTIME',
  'OPTIMIZING PIPELINE',
  'MAPPING DEVICE TARGETS',
  'INITIALIZING RUNTIME',
  'FINALIZING PACKAGE',
]

export default function FinalReveal({
  engine,
  onRestart,
  onWrite,
}: {
  engine: Engine
  onRestart: () => void
  onWrite: () => void
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
    s.push({ at: 250, run: () => play('confirm') })
    s.push({ at: 1600, run: () => { setPhase('decrypt'); play('whoosh') } })
    FINAL_LINES.forEach((line, i) => {
      s.push({
        at: i === 0 ? 600 : 640 + Math.round(Math.random() * 220),
        run: () => {
          setLogs((prev) => [...prev, { id: id.current++, text: line, kind: 'ok' }])
          setPct(Math.round(((i + 1) / FINAL_LINES.length) * 100))
          play('beep')
        },
      })
    })
    s.push({
      at: 800,
      run: () => {
        setPct(100)
        setPhase('ready')
        setLogs((prev) => [...prev, { id: id.current++, text: 'RUNTIME ONLINE', kind: 'ok' }])
        play('confirm')
      },
    })
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSequence(steps)

  return (
    <div className="cine final">
      <motion.div
        className="inner"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <GlitchText as="div" className="granted" text="ACCESS GRANTED" always intensity={0.16} />
        <div className="prod">
          {codename}
          <small>{subtitle}</small>
        </div>
        <div className="status">
          PACKAGE STATUS: {phase === 'ready' ? 'READY · TAP TO WRITE BUILD' : 'READY'}
        </div>

        {phase !== 'granted' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt24">
            <div style={{ maxWidth: 420, margin: '0 auto 8px' }}>
              <ProgressBar value={pct} />
            </div>
            <div className="faded" style={{ fontSize: 13, letterSpacing: '0.1em' }}>{pct}%</div>
            <div
              className="panel framed mt16"
              style={{ padding: 12, textAlign: 'left', maxWidth: 420, margin: '16px auto 0' }}
            >
              <TerminalLog lines={logs} />
            </div>
          </motion.div>
        )}

        {phase === 'ready' && (
          <motion.div
            className="mt24 row-center"
            style={{ gap: 12, flexWrap: 'wrap' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button className="btn primary" onClick={onWrite}>
              ▶ WRITE BUILD TO DEVICE
            </button>
            <button className="btn ghost" onClick={onRestart}>
              ◂ RETURN TO DIRECTORY
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

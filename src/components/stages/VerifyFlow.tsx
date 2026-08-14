import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSequence, type SequenceStep } from '../../hooks/useSequence'
import { useSound } from '../../hooks/useSoundToggle'
import TerminalLog, { type LogLine } from '../ui/TerminalLog'
import ProgressBar from '../ui/ProgressBar'
import GlitchText from '../ui/GlitchText'

interface VStep {
  text: string
  kind: LogLine['kind']
  pct: number
}

const VSTEPS: VStep[] = [
  { text: 'SEARCHING NETWORK...', kind: 'dim', pct: 15 },
  { text: 'NODE RESPONSE DETECTED...', kind: 'ok', pct: 33 },
  { text: 'VALIDATING SESSION...', kind: 'dim', pct: 51 },
  { text: 'CHECKING ACCESS TOKEN...', kind: 'dim', pct: 69 },
  { text: 'CORE SIGNATURE VERIFIED...', kind: 'ok', pct: 87 },
]

export default function VerifyFlow({ onDone }: { onDone: () => void }) {
  const { play } = useSound()
  const [logs, setLogs] = useState<LogLine[]>([])
  const [pct, setPct] = useState(0)
  const [mismatch, setMismatch] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [flash, setFlash] = useState(false)
  const [black, setBlack] = useState(false)
  const id = useRef(0)

  const add = (text: string, kind: LogLine['kind']) =>
    setLogs((prev) => [...prev, { id: id.current++, text, kind }].slice(-30))

  const steps: SequenceStep[] = useMemo(() => {
    const s: SequenceStep[] = []
    VSTEPS.forEach((st, i) => {
      s.push({
        at: i === 0 ? 300 : 520 + Math.round(Math.random() * 220),
        run: () => {
          add(st.text, st.kind)
          setPct(st.pct)
          play(st.text.startsWith('CONFIRMATIONS') ? 'confirm' : 'beep')
        },
      })
    })
    // red interruption → hard glitch + black frame
    s.push({
      at: 780,
      run: () => {
        setMismatch(true)
        setFlash(true)
        setBlack(true)
        setPct(100)
        add('!! SIGNATURE CONFLICT', 'err')
        play('warn')
        play('glitch')
        window.setTimeout(() => setFlash(false), 520)
        window.setTimeout(() => setBlack(false), 300)
      },
    })
    // override → authed
    s.push({
      at: 1100,
      run: () => {
        setMismatch(false)
        add('OVERRIDE ACCEPTED', 'ok')
        play('glitch')
      },
    })
    s.push({
      at: 700,
      run: () => {
        setAuthed(true)
        add('ACCESS AUTHENTICATED', 'ok')
        play('confirm')
      },
    })
    // no auto-advance — the user taps CONTINUE
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSequence(steps)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mt8">
        <ProgressBar value={pct} danger={mismatch} />
      </div>

      {mismatch && (
        <motion.div
          className="glow-red"
          style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, marginTop: 12, letterSpacing: '0.06em' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.3, 1] }}
          transition={{ duration: 0.5 }}
        >
          <GlitchText text="SIGNATURE CONFLICT" always />
        </motion.div>
      )}

      {authed && (
        <motion.div
          className="glow"
          style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, marginTop: 12, color: 'var(--green)', letterSpacing: '0.08em' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ACCESS AUTHENTICATED
        </motion.div>
      )}

      <div className="verify-log panel">
        <TerminalLog lines={logs} />
      </div>

      {authed && (
        <motion.div
          className="row-center"
          style={{ marginTop: 16 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <button className="btn primary" onClick={() => { play('whoosh'); onDone() }}>
            CONTINUE ▸
          </button>
        </motion.div>
      )}

      {flash && <div className="red-flash" />}
      {black && <div className="black-cut" />}
    </motion.div>
  )
}
